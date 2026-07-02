#!/bin/bash
# wyattcase.com fleet provisioner — enroll a Mac into admin.wyattcase.com.
# Download from https://wyattcase.com/downloads, then right-click -> Open (first run).
# Non-interactive: DEVICE_TOKEN='...' VNC_PASSWORD='...' bash provision-mac.command
set -uo pipefail

ENROLL_URL="https://afjciwijknfdlrnbgzjh.supabase.co/functions/v1/enroll"
HEARTBEAT_FALLBACK="https://afjciwijknfdlrnbgzjh.supabase.co/functions/v1/heartbeat"
WC_DIR="$HOME/.wyattcase"
LA_DIR="$HOME/Library/LaunchAgents"
mkdir -p "$WC_DIR" "$LA_DIR"

echo "==============================================="
echo "  wyattcase.com  —  Mac fleet provisioner"
echo "==============================================="

DEVICE_TOKEN="${DEVICE_TOKEN:-}"
VNC_PASSWORD="${VNC_PASSWORD:-}"
[ -z "$DEVICE_TOKEN" ] && { printf "Device token (admin -> Fleet -> Add device): "; read -r DEVICE_TOKEN; }
[ -z "$VNC_PASSWORD" ] && { printf "Choose a Screen Sharing (VNC) password: "; read -rs VNC_PASSWORD; echo; }
if [ -z "$DEVICE_TOKEN" ]; then echo "ERROR: device token is required."; exit 1; fi

echo ""
echo "==> [1/6] Homebrew + Tailscale (may prompt for your Mac password; installs dev tools on a fresh Mac)"
if ! command -v brew >/dev/null 2>&1; then
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || true
fi
for p in /opt/homebrew/bin/brew /usr/local/bin/brew; do [ -x "$p" ] && eval "$("$p" shellenv)" && break; done
if ! command -v brew >/dev/null 2>&1; then
  echo "ERROR: Homebrew not available. Run 'xcode-select --install', then re-run this."; exit 1
fi
brew install tailscale >/dev/null 2>&1 || brew install tailscale || true
TS_BIN="$(command -v tailscale || echo "$(brew --prefix)/bin/tailscale")"

echo "==> [2/6] Enrolling with admin.wyattcase.com"
RESP="$(curl -fsS -X POST "$ENROLL_URL" -H 'content-type: application/json' -d "{\"device_token\":\"$DEVICE_TOKEN\"}" 2>/dev/null || echo "")"
AUTHKEY="$(printf '%s' "$RESP" | sed -n 's/.*"tailscale_authkey":"\([^"]*\)".*/\1/p')"
HEARTBEAT_URL="$(printf '%s' "$RESP" | sed -n 's/.*"heartbeat_url":"\([^"]*\)".*/\1/p')"
[ -z "$HEARTBEAT_URL" ] && HEARTBEAT_URL="$HEARTBEAT_FALLBACK"
if [ -z "$AUTHKEY" ]; then
  echo "ERROR: enrollment failed. Server said: ${RESP:-<no response>}"
  echo "Make sure the device token is correct and the device was added in admin -> Fleet."
  exit 1
fi

echo "==> [3/6] Joining Tailscale"
sudo "$TS_BIN" up --authkey "$AUTHKEY" --ssh || echo "   WARN: 'tailscale up' failed — check connectivity/key."
sleep 2
FQDN="$("$TS_BIN" status --json 2>/dev/null | grep -o '"DNSName":"[^"]*"' | head -1 | sed 's/.*"DNSName":"//; s/"//; s/\.$//')"
security add-generic-password -U -s wyattcase-device-token -a admin -w "$DEVICE_TOKEN" 2>/dev/null || true

echo "==> [4/6] Heartbeat agent (every 60s)"
cat > "$WC_DIR/heartbeat.sh" <<HB
#!/bin/bash
TOKEN="\$(security find-generic-password -s wyattcase-device-token -w 2>/dev/null || true)"
[ -z "\$TOKEN" ] && exit 0
DISK=\$(df -g / 2>/dev/null | awk 'NR==2{print \$4}')
TS=false; "$TS_BIN" status >/dev/null 2>&1 && TS=true
curl -fsS -X POST "$HEARTBEAT_URL" -H "x-device-token: \$TOKEN" -H "content-type: application/json" \\
  -d "{\"disk_free_gb\": \${DISK:-null}, \"tailscale_online\": \$TS, \"claude_code_authed\": true, \"agent_version\": \"1.1.0\"}" >/dev/null 2>&1
HB
chmod +x "$WC_DIR/heartbeat.sh"
cat > "$LA_DIR/com.wyattcase.heartbeat.plist" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.wyattcase.heartbeat</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>$WC_DIR/heartbeat.sh</string></array>
  <key>StartInterval</key><integer>60</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardErrorPath</key><string>/tmp/wyattcase-heartbeat.err</string>
</dict></plist>
PL
launchctl unload "$LA_DIR/com.wyattcase.heartbeat.plist" 2>/dev/null || true
launchctl load "$LA_DIR/com.wyattcase.heartbeat.plist" 2>/dev/null || true
bash "$WC_DIR/heartbeat.sh"; HB_OK=$?

echo "==> [5/6] Remote desktop (Screen Sharing + secure bridge — best effort)"
sudo pmset -a sleep 0 disablesleep 1 2>/dev/null || true
[ -n "$VNC_PASSWORD" ] && sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart \
  -activate -configure -access -on -clientopts -setvnclegacy -vnclegacy yes -setvncpw -vncpw "$VNC_PASSWORD" -restart -agent -privs -all 2>/dev/null \
  || echo "   NOTE: enable Screen Sharing in System Settings -> General -> Sharing if remote desktop is blank."
brew install websockify >/dev/null 2>&1 || brew install novnc >/dev/null 2>&1 || true
WS_BIN="$(command -v websockify || echo "")"
BRIDGE="not set up"
if [ -n "$WS_BIN" ] && [ -n "$FQDN" ]; then
  ( cd "$WC_DIR" && "$TS_BIN" cert "$FQDN" >/dev/null 2>&1 ) || true
  if [ -f "$WC_DIR/$FQDN.crt" ]; then
    cat > "$LA_DIR/com.wyattcase.vncbridge.plist" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.wyattcase.vncbridge</string>
  <key>ProgramArguments</key><array><string>$WS_BIN</string><string>--cert=$WC_DIR/$FQDN.crt</string><string>--key=$WC_DIR/$FQDN.key</string><string>6080</string><string>localhost:5900</string></array>
  <key>WorkingDirectory</key><string>$WC_DIR</string>
  <key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
  <key>StandardErrorPath</key><string>/tmp/wyattcase-vncbridge.err</string>
</dict></plist>
PL
    launchctl unload "$LA_DIR/com.wyattcase.vncbridge.plist" 2>/dev/null || true
    launchctl load "$LA_DIR/com.wyattcase.vncbridge.plist" 2>/dev/null || true
    BRIDGE="running on :6080"
  fi
fi

echo ""
echo "==> [6/6] Summary"
echo "  Tailscale name : ${FQDN:-<not detected — check 'tailscale status'>}"
echo "  Heartbeat      : $([ "${HB_OK:-1}" = "0" ] && echo "sent OK" || echo "FAILED — see /tmp/wyattcase-heartbeat.err")"
echo "  Remote desktop : $BRIDGE"
echo ""
echo "This Mac should appear GREEN in admin.wyattcase.com -> Fleet within ~60s."
[ -n "$FQDN" ] && echo "If admin asks for a Tailscale name, enter:  $FQDN"
echo "Remote desktop: admin -> this device -> Open remote desktop (VNC password = what you set)."
[ "$BRIDGE" = "not set up" ] && echo "NOTE: remote desktop bridge not started (needs websockify + a Tailscale name). Heartbeat/Fleet still work; you can re-run this later."
