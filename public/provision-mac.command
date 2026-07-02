#!/bin/bash
# wyattcase.com fleet provisioner — run ONCE on a new Mac to enroll it into admin.wyattcase.com.
# Download from https://wyattcase.com/downloads, then right-click -> Open (or: bash provision-mac.command).
set -uo pipefail

HEARTBEAT_URL="https://afjciwijknfdlrnbgzjh.supabase.co/functions/v1/heartbeat"
WC_DIR="$HOME/.wyattcase"
LA_DIR="$HOME/Library/LaunchAgents"
mkdir -p "$WC_DIR" "$LA_DIR"

echo "==============================================="
echo "  wyattcase.com  —  Mac fleet provisioner"
echo "==============================================="
echo "Enrolls THIS Mac into admin.wyattcase.com:"
echo "  Tailscale + health reporting + in-browser remote desktop."
echo ""

DEVICE_TOKEN="${DEVICE_TOKEN:-}"
TAILSCALE_AUTHKEY="${TAILSCALE_AUTHKEY:-}"
VNC_PASSWORD="${VNC_PASSWORD:-}"
[ -z "$DEVICE_TOKEN" ] && { printf "Device token (admin -> Fleet -> Add device): "; read -r DEVICE_TOKEN; }
[ -z "$TAILSCALE_AUTHKEY" ] && { printf "Tailscale auth key (Tailscale admin -> Settings -> Keys): "; read -r TAILSCALE_AUTHKEY; }
[ -z "$VNC_PASSWORD" ] && { printf "Choose a Screen Sharing (VNC) password: "; read -rs VNC_PASSWORD; echo; }
if [ -z "$DEVICE_TOKEN" ] || [ -z "$TAILSCALE_AUTHKEY" ]; then
  echo "ERROR: device token and Tailscale key are both required."; exit 1
fi

echo ""
echo "==> [1/6] Installing Homebrew + tooling (may prompt for your Mac password)"
if ! command -v brew >/dev/null 2>&1; then
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || true
  eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv 2>/dev/null || true)"
fi
brew install tailscale gh vercel-cli supabase/tap/supabase 2>/dev/null || true
command -v npm >/dev/null 2>&1 && npm install -g @anthropic-ai/claude-code >/dev/null 2>&1 || true

echo "==> [2/6] Storing device token in Keychain"
security add-generic-password -U -s wyattcase-device-token -a admin -w "$DEVICE_TOKEN"

echo "==> [3/6] Joining Tailscale"
sudo tailscale up --authkey "$TAILSCALE_AUTHKEY" --ssh || echo "   WARN: tailscale up failed — check the key."
FQDN="$(tailscale status --json 2>/dev/null | /usr/bin/python3 -c 'import sys,json;print(json.load(sys.stdin)["Self"]["DNSName"].rstrip("."))' 2>/dev/null || echo "")"

echo "==> [4/6] Installing heartbeat agent (every 60s)"
cat > "$WC_DIR/heartbeat.sh" <<HB
#!/bin/bash
set -euo pipefail
TOKEN="\$(security find-generic-password -s wyattcase-device-token -w 2>/dev/null || true)"
[ -z "\$TOKEN" ] && exit 1
DISK=\$(df -g / | awk 'NR==2{print \$4}')
TS=false; tailscale status >/dev/null 2>&1 && TS=true
CC=false; command -v claude >/dev/null 2>&1 && CC=true
curl -fsS -X POST "$HEARTBEAT_URL" -H "x-device-token: \$TOKEN" -H "content-type: application/json" \\
  -d "{\"disk_free_gb\": \${DISK:-null}, \"tailscale_online\": \$TS, \"claude_code_authed\": \$CC, \"agent_version\": \"1.0.0\"}" >/dev/null
HB
chmod +x "$WC_DIR/heartbeat.sh"
cat > "$LA_DIR/com.wyattcase.heartbeat.plist" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.wyattcase.heartbeat</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>-lc</string><string>\$HOME/.wyattcase/heartbeat.sh</string></array>
  <key>StartInterval</key><integer>60</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardErrorPath</key><string>/tmp/wyattcase-heartbeat.err</string>
</dict></plist>
PL
launchctl unload "$LA_DIR/com.wyattcase.heartbeat.plist" 2>/dev/null || true
launchctl load "$LA_DIR/com.wyattcase.heartbeat.plist"

echo "==> [5/6] Enabling remote desktop (Screen Sharing + secure bridge)"
sudo pmset -a sleep 0 disablesleep 1 2>/dev/null || true
if [ -n "$VNC_PASSWORD" ]; then
  sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart \
    -activate -configure -access -on -clientopts -setvnclegacy -vnclegacy yes -setvncpw -vncpw "$VNC_PASSWORD" -restart -agent -privs -all 2>/dev/null \
    || echo "   NOTE: could not auto-enable Screen Sharing — turn it on in System Settings -> General -> Sharing."
fi
/usr/bin/python3 -m pip install --user --quiet websockify 2>/dev/null || /usr/bin/python3 -m pip install --user --break-system-packages --quiet websockify 2>/dev/null || true
if [ -n "$FQDN" ]; then
  ( cd "$WC_DIR" && tailscale cert "$FQDN" 2>/dev/null ) || echo "   NOTE: tailscale cert failed; remote desktop bridge will retry after certs exist."
  cat > "$LA_DIR/com.wyattcase.vncbridge.plist" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.wyattcase.vncbridge</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>-lc</string>
  <string>cd "$WC_DIR" &amp;&amp; exec /usr/bin/python3 -m websockify --cert="$FQDN.crt" --key="$FQDN.key" 6080 localhost:5900</string></array>
  <key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
  <key>StandardErrorPath</key><string>/tmp/wyattcase-vncbridge.err</string>
</dict></plist>
PL
  launchctl unload "$LA_DIR/com.wyattcase.vncbridge.plist" 2>/dev/null || true
  launchctl load "$LA_DIR/com.wyattcase.vncbridge.plist"
fi

echo ""
echo "==> [6/6] Done."
echo "This Mac should turn GREEN in admin.wyattcase.com -> Fleet within ~60s."
[ -n "$FQDN" ] && echo "Tailscale name (enter in admin if it asks for remote desktop): $FQDN"
echo "Remote desktop: admin -> this device -> Open remote desktop (use the VNC password you set)."
echo "If the remote screen is blank, enable System Settings -> General -> Sharing -> Screen Sharing."
