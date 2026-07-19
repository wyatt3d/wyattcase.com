#!/bin/bash
# ==========================================================================
#  wyattcase.com — Mac fleet provisioner
# ==========================================================================
# Enrolls this Mac into your fleet and makes it fully controllable from the
# hub: joins Tailscale, installs the Claude voice stack, turns on in-browser
# remote desktop, and starts reporting health. One run, no config files.
#
# Downloaded from admin -> Fleet -> "Download installer for this Mac", the
# DEVICE_TOKEN and VNC_PASSWORD below are already filled in for you — just
# open the file (right-click -> Open the first time) and enter your Mac login
# password if asked. Nothing to paste.
#
# ---- filled in automatically when downloaded from admin -------------------
DEVICE_TOKEN="${DEVICE_TOKEN:-}"
VNC_PASSWORD="${VNC_PASSWORD:-}"
# --------------------------------------------------------------------------
set -uo pipefail

ENROLL_URL="https://afjciwijknfdlrnbgzjh.supabase.co/functions/v1/enroll"
HEARTBEAT_FALLBACK="https://afjciwijknfdlrnbgzjh.supabase.co/functions/v1/heartbeat"
# Hub's fleet SSH public key — lets the hub reach this Mac's Claude session.
HUB_FLEET_PUBKEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIO9YMl+1EXNXKgHynOhUiqqFF/tt1PIyPEIOCX6KVp2N fleet-claude@wyatts-mac-mini"
WC_DIR="$HOME/.wyattcase"
LA_DIR="$HOME/Library/LaunchAgents"
mkdir -p "$WC_DIR" "$LA_DIR" "$HOME/.ssh"
chmod 700 "$HOME/.ssh"

STEPS=8
say() { printf "\n\033[1;36m==> [%s/%s] %s\033[0m\n" "$1" "$STEPS" "$2"; }
warn() { printf "   \033[33mNOTE: %s\033[0m\n" "$1"; }

clear 2>/dev/null || true
echo "==============================================="
echo "  wyattcase.com  —  Mac fleet provisioner"
echo "==============================================="

# Prompt only if the download didn't pre-fill them (manual / public fallback).
if [ -z "$DEVICE_TOKEN" ]; then
  printf "Device token (admin -> Fleet -> Add device): "; read -r DEVICE_TOKEN
fi
if [ -z "$DEVICE_TOKEN" ]; then echo "ERROR: device token is required."; exit 1; fi
if [ -z "$VNC_PASSWORD" ]; then
  VNC_PASSWORD="$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 12)"
  echo "Generated a Screen Sharing password (saved to admin): $VNC_PASSWORD"
fi

# Keep the Mac awake so it stays reachable (best effort; needs admin).
sudo -v 2>/dev/null || warn "no admin password entered — some steps may be skipped"
sudo pmset -a sleep 0 disablesleep 1 2>/dev/null || true

# --------------------------------------------------------------------------
say 1 "Installing developer tools + Homebrew (first run on a fresh Mac is slow)"
if ! xcode-select -p >/dev/null 2>&1; then
  xcode-select --install 2>/dev/null || true
  warn "if a 'install command line tools' dialog appeared, finish it, then re-run this."
fi
if ! command -v brew >/dev/null 2>&1; then
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || true
fi
for p in /opt/homebrew/bin/brew /usr/local/bin/brew; do
  [ -x "$p" ] && eval "$("$p" shellenv)" && break
done
if ! command -v brew >/dev/null 2>&1; then
  echo "ERROR: Homebrew not available. Run 'xcode-select --install', then re-run this."; exit 1
fi
BREW_PREFIX="$(brew --prefix)"

# --------------------------------------------------------------------------
say 2 "Installing fleet tools (Tailscale, tmux, voice stack)"
brew_install() { brew list "$1" >/dev/null 2>&1 || brew install "$1" >/dev/null 2>&1 || brew install "$1" || warn "could not install $1"; }
brew_install tailscale
brew_install tmux
brew_install sox
brew_install whisper-cpp
TS_BIN="$(command -v tailscale || echo "$BREW_PREFIX/bin/tailscale")"

# Whisper model for on-device speech (small, English) — used by the hub only,
# but harmless to have; skip if the hub already does STT centrally.
MODEL="$WC_DIR/models/ggml-base.en.bin"
if [ ! -s "$MODEL" ]; then
  mkdir -p "$WC_DIR/models"
  curl -fsSL -o "$MODEL" "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin" 2>/dev/null || warn "whisper model download skipped (hub does STT anyway)"
fi

# --------------------------------------------------------------------------
say 3 "Installing Claude Code"
if ! command -v claude >/dev/null 2>&1 && [ ! -x "$HOME/.local/bin/claude" ]; then
  curl -fsSL https://claude.ai/install.sh | bash >/dev/null 2>&1 \
    || npm install -g @anthropic-ai/claude-code >/dev/null 2>&1 \
    || warn "Claude Code install needs attention — finish it over remote desktop."
fi
CLAUDE_BIN="$(command -v claude || echo "$HOME/.local/bin/claude")"
case ":$PATH:" in *":$HOME/.local/bin:"*) : ;; *) echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc" ;; esac

# --------------------------------------------------------------------------
say 4 "Enrolling with admin.wyattcase.com"
RESP="$(curl -fsS -X POST "$ENROLL_URL" -H 'content-type: application/json' -d "{\"device_token\":\"$DEVICE_TOKEN\"}" 2>/dev/null || echo "")"
AUTHKEY="$(printf '%s' "$RESP" | sed -n 's/.*"tailscale_authkey":"\([^"]*\)".*/\1/p')"
HEARTBEAT_URL="$(printf '%s' "$RESP" | sed -n 's/.*"heartbeat_url":"\([^"]*\)".*/\1/p')"
[ -z "$HEARTBEAT_URL" ] && HEARTBEAT_URL="$HEARTBEAT_FALLBACK"
if [ -z "$AUTHKEY" ]; then
  echo "ERROR: enrollment failed. Server said: ${RESP:-<no response>}"
  echo "Re-download the installer from admin -> Fleet (the token may have been used)."
  exit 1
fi
security add-generic-password -U -s wyattcase-device-token -a admin -w "$DEVICE_TOKEN" 2>/dev/null || true

# --------------------------------------------------------------------------
say 5 "Joining Tailscale"
sudo "$TS_BIN" up --authkey "$AUTHKEY" --ssh --accept-routes 2>/dev/null \
  || warn "'tailscale up' failed — check internet, then re-run."
sleep 2
FQDN="$("$TS_BIN" status --json 2>/dev/null | grep -o '"DNSName":"[^"]*"' | head -1 | sed 's/.*"DNSName":"//; s/"//; s/\.$//')"

# --------------------------------------------------------------------------
say 6 "Allowing the hub to reach this Mac (SSH + Claude session)"
# trust the hub's fleet key (idempotent)
touch "$HOME/.ssh/authorized_keys"; chmod 600 "$HOME/.ssh/authorized_keys"
grep -qF "$HUB_FLEET_PUBKEY" "$HOME/.ssh/authorized_keys" 2>/dev/null \
  || echo "$HUB_FLEET_PUBKEY" >> "$HOME/.ssh/authorized_keys"
# enable Remote Login (sshd) without needing Full Disk Access
sudo launchctl load -w /System/Library/LaunchDaemons/ssh.plist 2>/dev/null || true
# a login-persistent tmux "claude" session the hub can attach to / dispatch into
cat > "$WC_DIR/claude-session.sh" <<CS
#!/bin/bash
export PATH="$BREW_PREFIX/bin:/usr/local/bin:\$HOME/.local/bin:\$PATH"
tmux has-session -t claude 2>/dev/null || tmux new-session -d -s claude "exec $CLAUDE_BIN"
CS
chmod +x "$WC_DIR/claude-session.sh"
cat > "$LA_DIR/com.wyattcase.claude-session.plist" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.wyattcase.claude-session</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>$WC_DIR/claude-session.sh</string></array>
  <key>RunAtLoad</key><true/>
  <key>StartInterval</key><integer>120</integer>
  <key>StandardErrorPath</key><string>/tmp/wyattcase-claude-session.err</string>
</dict></plist>
PL
launchctl unload "$LA_DIR/com.wyattcase.claude-session.plist" 2>/dev/null || true
launchctl load "$LA_DIR/com.wyattcase.claude-session.plist" 2>/dev/null || true
bash "$WC_DIR/claude-session.sh" 2>/dev/null || true

# --------------------------------------------------------------------------
say 7 "Turning on remote desktop (Screen Sharing + secure browser bridge)"
sudo /System/Library/CoreServices/RemoteManagement/ARDAgent.app/Contents/Resources/kickstart \
  -activate -configure -access -on -clientopts -setvnclegacy -vnclegacy yes \
  -setvncpw -vncpw "$VNC_PASSWORD" -restart -agent -privs -all 2>/dev/null \
  || warn "enable System Settings -> General -> Sharing -> Screen Sharing if remote desktop is blank."
brew_install websockify
WS_BIN="$(command -v websockify || echo "")"
BRIDGE="not started"
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

# --------------------------------------------------------------------------
say 8 "Starting health reporting (every 60s)"
cat > "$WC_DIR/heartbeat.sh" <<HB
#!/bin/bash
TOKEN="\$(security find-generic-password -s wyattcase-device-token -w 2>/dev/null || true)"
[ -z "\$TOKEN" ] && exit 0
DISK=\$(df -g / 2>/dev/null | awk 'NR==2{print \$4}')
TS=false; "$TS_BIN" status >/dev/null 2>&1 && TS=true
CA=false; ("$CLAUDE_BIN" --version >/dev/null 2>&1) && [ -f "\$HOME/.claude/.credentials.json" -o -f "\$HOME/.claude.json" ] && CA=true
curl -fsS -X POST "$HEARTBEAT_URL" -H "x-device-token: \$TOKEN" -H "content-type: application/json" \\
  -d "{\"disk_free_gb\": \${DISK:-null}, \"tailscale_online\": \$TS, \"claude_code_authed\": \$CA, \"agent_version\": \"2.0.0\"}" >/dev/null 2>&1
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

# --------------------------------------------------------------------------
echo ""
echo "==============================================="
echo "  Done — this Mac is now on your fleet"
echo "==============================================="
echo "  Tailscale name : ${FQDN:-<check 'tailscale status'>}"
echo "  Health report  : $([ "${HB_OK:-1}" = "0" ] && echo "sent OK" || echo "FAILED (see /tmp/wyattcase-heartbeat.err)")"
echo "  Remote desktop : $BRIDGE"
echo "  Claude session : tmux 'claude' (hub can attach + voice-dispatch)"
echo ""
echo "It should appear GREEN in admin.wyattcase.com -> Fleet within ~60s,"
echo "and in the hub's desktop Fleet widget as a talk-to target."
echo ""
echo "One thing left to do over remote desktop: open Terminal on this Mac,"
echo "run 'claude', and sign in once so it can do work."
