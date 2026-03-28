"use client";

import { useState, useEffect, useCallback } from "react";
import type { WindowState } from "@/lib/types";

interface Props {
  window: WindowState;
}

const WALLPAPER_OPTIONS = [
  { name: "Midnight", value: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" },
  { name: "Deep Space", value: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" },
  { name: "Aurora", value: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)" },
  { name: "Ocean", value: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" },
  { name: "Void", value: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0d1b2a 100%)" },
  { name: "Steel", value: "linear-gradient(135deg, #141e30 0%, #243b55 100%)" },
  { name: "Sunset", value: "linear-gradient(135deg, #e65c00 0%, #f9d423 100%)" },
  { name: "Rose", value: "linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)" },
  { name: "Emerald", value: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)" },
  { name: "Lavender", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Crimson", value: "linear-gradient(135deg, #870000 0%, #190a05 100%)" },
  { name: "Frost", value: "linear-gradient(135deg, #c9d6ff 0%, #e2e2e2 100%)" },
];

type Category =
  | "general"
  | "appearance"
  | "dock"
  | "display"
  | "wallpaper"
  | "sound"
  | "about";

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: "general", label: "General", icon: "⚙️" },
  { id: "appearance", label: "Appearance", icon: "🎨" },
  { id: "dock", label: "Desktop & Dock", icon: "⬛" },
  { id: "display", label: "Display", icon: "🖥️" },
  { id: "wallpaper", label: "Wallpaper", icon: "🏞️" },
  { id: "sound", label: "Sound", icon: "🔊" },
  { id: "about", label: "About", icon: "ℹ️" },
];

function getStoredSettings() {
  try {
    const raw = localStorage.getItem("wyattcase-settings");
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function storeSettings(settings: Record<string, unknown>) {
  try {
    const existing = getStoredSettings();
    localStorage.setItem(
      "wyattcase-settings",
      JSON.stringify({ ...existing, ...settings })
    );
  } catch {
    // ignore
  }
}

export default function SettingsApp({ window: _win }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>("general");
  const [search, setSearch] = useState("");
  const [appearance, setAppearance] = useState<"light" | "dark" | "auto">("dark");
  const [dockSize, setDockSize] = useState(48);
  const [magnification, setMagnification] = useState(true);
  const [dockPosition, setDockPosition] = useState<"left" | "bottom" | "right">("bottom");
  const [volume, setVolume] = useState(75);
  const [currentWallpaper, setCurrentWallpaper] = useState(WALLPAPER_OPTIONS[0].value);
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);

  // Load persisted settings on mount
  useEffect(() => {
    const saved = getStoredSettings();
    if (saved.appearance) setAppearance(saved.appearance);
    if (saved.dockSize != null) setDockSize(saved.dockSize);
    if (saved.magnification != null) setMagnification(saved.magnification);
    if (saved.dockPosition) setDockPosition(saved.dockPosition);
    if (saved.volume != null) setVolume(saved.volume);

    try {
      const wp = localStorage.getItem("wyattcase-wallpaper");
      if (wp) setCurrentWallpaper(wp);
    } catch {
      // ignore
    }

    setScreenWidth(window.screen.width);
    setScreenHeight(window.screen.height);
  }, []);

  // Apply appearance class to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark", "theme-auto");
    root.classList.add(`theme-${appearance}`);
    storeSettings({ appearance });
  }, [appearance]);

  const handleWallpaperChange = useCallback((value: string) => {
    setCurrentWallpaper(value);
    const el = document.getElementById("desktop-bg");
    if (el) el.style.background = value;
    try {
      localStorage.setItem("wyattcase-wallpaper", value);
    } catch {
      // ignore
    }
  }, []);

  const handleDockSize = useCallback((val: number) => {
    setDockSize(val);
    storeSettings({ dockSize: val });
  }, []);

  const handleMagnification = useCallback((val: boolean) => {
    setMagnification(val);
    storeSettings({ magnification: val });
  }, []);

  const handleDockPosition = useCallback((val: "left" | "bottom" | "right") => {
    setDockPosition(val);
    storeSettings({ dockPosition: val });
  }, []);

  const handleVolume = useCallback((val: number) => {
    setVolume(val);
    storeSettings({ volume: val });
  }, []);

  const filteredCategories = search.trim()
    ? CATEGORIES.filter((c) =>
        c.label.toLowerCase().includes(search.toLowerCase())
      )
    : CATEGORIES;

  return (
    <div className="flex h-full bg-[#1e1e1e] text-white text-[13px]">
      {/* Sidebar */}
      <div className="w-[220px] bg-[rgba(30,30,30,0.85)] border-r border-white/10 flex flex-col shrink-0">
        {/* Search */}
        <div className="p-3 pb-2">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-[12px]">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 rounded-md pl-8 pr-3 py-[5px] text-[13px] text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-blue-500/50 border border-white/5"
            />
          </div>
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {filteredCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full text-left px-2.5 py-[6px] flex items-center gap-2.5 rounded-md mb-0.5 transition-colors ${
                activeCategory === cat.id
                  ? "bg-blue-500/80 text-white"
                  : "text-white/80 hover:bg-white/8"
              }`}
            >
              <span className="text-[16px] w-5 text-center shrink-0">{cat.icon}</span>
              <span className="truncate">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[560px] mx-auto py-6 px-8">
          {activeCategory === "general" && <GeneralPane />}
          {activeCategory === "appearance" && (
            <AppearancePane appearance={appearance} onChange={setAppearance} />
          )}
          {activeCategory === "dock" && (
            <DockPane
              dockSize={dockSize}
              magnification={magnification}
              dockPosition={dockPosition}
              onSizeChange={handleDockSize}
              onMagnificationChange={handleMagnification}
              onPositionChange={handleDockPosition}
            />
          )}
          {activeCategory === "display" && (
            <DisplayPane screenWidth={screenWidth} screenHeight={screenHeight} />
          )}
          {activeCategory === "wallpaper" && (
            <WallpaperPane
              current={currentWallpaper}
              onChange={handleWallpaperChange}
            />
          )}
          {activeCategory === "sound" && (
            <SoundPane volume={volume} onChange={handleVolume} />
          )}
          {activeCategory === "about" && (
            <AboutPane screenWidth={screenWidth} screenHeight={screenHeight} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared UI helpers                                                  */
/* ------------------------------------------------------------------ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[22px] font-semibold text-white mb-5">{children}</h2>
  );
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-b-0">
      <span className="text-white/90">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/5 rounded-xl border border-white/5 px-4 mb-4">
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-[42px] h-[26px] rounded-full transition-colors shrink-0 ${
        checked ? "bg-blue-500" : "bg-white/20"
      }`}
    >
      <span
        className={`absolute top-[3px] w-[20px] h-[20px] rounded-full bg-white shadow transition-transform ${
          checked ? "left-[19px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Panes                                                              */
/* ------------------------------------------------------------------ */

function GeneralPane() {
  return (
    <>
      <SectionTitle>General</SectionTitle>

      {/* User card */}
      <div className="bg-white/5 rounded-xl border border-white/5 p-4 mb-4 flex items-center gap-4">
        <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-[24px] font-semibold text-white shrink-0">
          WC
        </div>
        <div>
          <div className="text-[16px] font-semibold">Wyatt Case</div>
          <div className="text-white/40 text-[12px]">Apple&nbsp;ID, iCloud & Purchases</div>
        </div>
      </div>

      <Card>
        <SettingRow label="Software Update">
          <span className="text-white/40 text-[12px]">macOS is up to date</span>
        </SettingRow>
        <SettingRow label="Storage">
          <span className="text-white/40 text-[12px]">∞ available</span>
        </SettingRow>
        <SettingRow label="AirDrop & Handoff">
          <span className="text-white/40 text-[12px]">On</span>
        </SettingRow>
        <SettingRow label="Login Items">
          <span className="text-white/40 text-[12px]">0 items</span>
        </SettingRow>
      </Card>
    </>
  );
}

function AppearancePane({
  appearance,
  onChange,
}: {
  appearance: "light" | "dark" | "auto";
  onChange: (v: "light" | "dark" | "auto") => void;
}) {
  const options: { id: "light" | "dark" | "auto"; label: string; preview: string }[] = [
    { id: "light", label: "Light", preview: "bg-[#f5f5f7]" },
    { id: "dark", label: "Dark", preview: "bg-[#1e1e1e]" },
    { id: "auto", label: "Auto", preview: "bg-gradient-to-r from-[#f5f5f7] to-[#1e1e1e]" },
  ];

  return (
    <>
      <SectionTitle>Appearance</SectionTitle>
      <Card>
        <div className="py-4">
          <div className="text-white/60 text-[12px] mb-3">Appearance</div>
          <div className="flex gap-4">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onChange(opt.id)}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={`w-[72px] h-[52px] rounded-lg border-2 transition-colors ${opt.preview} ${
                    appearance === opt.id
                      ? "border-blue-500"
                      : "border-white/10 group-hover:border-white/20"
                  }`}
                />
                <span
                  className={`text-[12px] ${
                    appearance === opt.id ? "text-blue-400" : "text-white/60"
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <SettingRow label="Accent colour">
          <div className="flex gap-1.5">
            {["#007aff", "#ff3b30", "#ff9500", "#ffcc00", "#34c759", "#af52de", "#ff2d55", "#8e8e93"].map(
              (c) => (
                <span
                  key={c}
                  className="w-4 h-4 rounded-full border border-white/10 cursor-pointer"
                  style={{ background: c }}
                />
              )
            )}
          </div>
        </SettingRow>
        <SettingRow label="Sidebar icon size">
          <span className="text-white/40 text-[12px]">Medium</span>
        </SettingRow>
      </Card>
    </>
  );
}

function DockPane({
  dockSize,
  magnification,
  dockPosition,
  onSizeChange,
  onMagnificationChange,
  onPositionChange,
}: {
  dockSize: number;
  magnification: boolean;
  dockPosition: "left" | "bottom" | "right";
  onSizeChange: (v: number) => void;
  onMagnificationChange: (v: boolean) => void;
  onPositionChange: (v: "left" | "bottom" | "right") => void;
}) {
  return (
    <>
      <SectionTitle>Desktop &amp; Dock</SectionTitle>

      <Card>
        <SettingRow label="Size">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/40">Small</span>
            <input
              type="range"
              min={32}
              max={80}
              value={dockSize}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="w-[120px] accent-blue-500"
            />
            <span className="text-[11px] text-white/40">Large</span>
          </div>
        </SettingRow>
        <SettingRow label="Magnification">
          <Toggle checked={magnification} onChange={onMagnificationChange} />
        </SettingRow>
      </Card>

      <Card>
        <div className="py-3">
          <div className="text-white/90 mb-3">Position on screen</div>
          <div className="flex gap-2">
            {(["left", "bottom", "right"] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => onPositionChange(pos)}
                className={`px-4 py-1.5 rounded-md text-[12px] capitalize transition-colors ${
                  dockPosition === pos
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white/60 hover:bg-white/15"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <SettingRow label="Minimise windows using">
          <span className="text-white/40 text-[12px]">Genie Effect</span>
        </SettingRow>
        <SettingRow label="Double-click title bar">
          <span className="text-white/40 text-[12px]">Zoom</span>
        </SettingRow>
        <SettingRow label="Automatically hide and show the Dock">
          <Toggle checked={false} onChange={() => {}} />
        </SettingRow>
        <SettingRow label="Show recent applications in Dock">
          <Toggle checked={true} onChange={() => {}} />
        </SettingRow>
      </Card>
    </>
  );
}

function DisplayPane({
  screenWidth,
  screenHeight,
}: {
  screenWidth: number;
  screenHeight: number;
}) {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

  return (
    <>
      <SectionTitle>Display</SectionTitle>

      {/* Display preview */}
      <div className="bg-white/5 rounded-xl border border-white/5 p-6 mb-4 flex flex-col items-center">
        <div className="w-[160px] h-[100px] bg-gradient-to-b from-[#3a3f47] to-[#2a2d33] rounded-lg border border-white/10 flex items-center justify-center mb-3 shadow-lg">
          <div className="w-[140px] h-[82px] bg-gradient-to-br from-blue-600/40 to-purple-600/40 rounded-[4px]" />
        </div>
        <div className="w-[40px] h-[3px] bg-white/10 rounded-full mb-1" />
        <div className="w-[60px] h-[2px] bg-white/10 rounded-full" />
        <div className="text-[12px] text-white/50 mt-3">Built-in Display</div>
      </div>

      <Card>
        <SettingRow label="Resolution">
          <span className="text-white/40 text-[12px]">
            {screenWidth} &times; {screenHeight}
            {dpr > 1 ? ` @${dpr}x` : ""}
          </span>
        </SettingRow>
        <SettingRow label="Refresh rate">
          <span className="text-white/40 text-[12px]">Variable</span>
        </SettingRow>
        <SettingRow label="Brightness">
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={100}
            className="w-[120px] accent-blue-500"
          />
        </SettingRow>
        <SettingRow label="True Tone">
          <Toggle checked={true} onChange={() => {}} />
        </SettingRow>
        <SettingRow label="Night Shift">
          <span className="text-white/40 text-[12px]">Off</span>
        </SettingRow>
      </Card>
    </>
  );
}

function WallpaperPane({
  current,
  onChange,
}: {
  current: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <SectionTitle>Wallpaper</SectionTitle>
      <p className="text-white/40 text-[12px] mb-4">
        Choose a wallpaper for your desktop background.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {WALLPAPER_OPTIONS.map((wp) => (
          <button
            key={wp.name}
            onClick={() => onChange(wp.value)}
            className="group flex flex-col items-center gap-2"
          >
            <div
              className={`w-full aspect-[16/10] rounded-lg border-2 transition-colors ${
                current === wp.value
                  ? "border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.5)]"
                  : "border-white/10 group-hover:border-white/20"
              }`}
              style={{ background: wp.value }}
            />
            <span
              className={`text-[11px] ${
                current === wp.value ? "text-blue-400" : "text-white/50"
              }`}
            >
              {wp.name}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function SoundPane({
  volume,
  onChange,
}: {
  volume: number;
  onChange: (v: number) => void;
}) {
  return (
    <>
      <SectionTitle>Sound</SectionTitle>

      <Card>
        <div className="py-3">
          <div className="text-white/90 mb-3">Output volume</div>
          <div className="flex items-center gap-3">
            <span className="text-[14px]">🔇</span>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => onChange(Number(e.target.value))}
              className="flex-1 accent-blue-500"
            />
            <span className="text-[14px]">🔊</span>
          </div>
          <div className="text-right text-white/40 text-[11px] mt-1">{volume}%</div>
        </div>
      </Card>

      <Card>
        <SettingRow label="Output device">
          <span className="text-white/40 text-[12px]">Built-in Speakers</span>
        </SettingRow>
        <SettingRow label="Input device">
          <span className="text-white/40 text-[12px]">Built-in Microphone</span>
        </SettingRow>
        <SettingRow label="Alert sound">
          <span className="text-white/40 text-[12px]">Boop</span>
        </SettingRow>
        <SettingRow label="Play sound on startup">
          <Toggle checked={true} onChange={() => {}} />
        </SettingRow>
      </Card>
    </>
  );
}

function AboutPane({
  screenWidth,
  screenHeight,
}: {
  screenWidth: number;
  screenHeight: number;
}) {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  return (
    <>
      <SectionTitle>About</SectionTitle>

      <div className="bg-white/5 rounded-xl border border-white/5 p-6 mb-4 flex flex-col items-center text-center">
        {/* macOS logo */}
        <div className="text-[48px] mb-2">🍎</div>
        <div className="text-[20px] font-semibold mb-1">macOS Web Edition</div>
        <div className="text-[12px] text-white/40 mb-4">Version 1.0 (wyattcase.com)</div>

        <div className="w-full border-t border-white/5 pt-4 text-left space-y-2.5">
          <div className="flex justify-between">
            <span className="text-white/50">Machine</span>
            <span className="text-white/80">Wyatt&apos;s Web Mac</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Chip</span>
            <span className="text-white/80">WebAssembly Virtual</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Memory</span>
            <span className="text-white/80">Unlimited</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Browser</span>
            <span className="text-white/80">{browser}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Screen Resolution</span>
            <span className="text-white/80">
              {screenWidth} &times; {screenHeight}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Serial Number</span>
            <span className="text-white/80">WC-WEB-2025</span>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-white/30">
        &copy; 2025 Wyatt Case. All rights reserved.
      </div>
    </>
  );
}
