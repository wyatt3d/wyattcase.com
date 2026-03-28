"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useDesktopStore } from "@/lib/store";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DockApp {
  id: string;
  name: string;
  icon: string;
}

interface DockProps {
  onOpenApp?: (appId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DOCK_APPS: DockApp[] = [
  { id: "finder", name: "Finder", icon: "📁" },
  { id: "safari", name: "Safari", icon: "🧭" },
  { id: "calculator", name: "Calculator", icon: "🔢" },
  { id: "calendar", name: "Calendar", icon: "📅" },
  { id: "notes", name: "Notes", icon: "📒" },
  { id: "photos", name: "Photos", icon: "🖼️" },
  { id: "music", name: "Music", icon: "🎵" },
  { id: "textedit", name: "TextEdit", icon: "📝" },
  { id: "terminal", name: "Terminal", icon: "🖥️" },
  { id: "settings", name: "Settings", icon: "⚙️" },
];

const TRASH_APP: DockApp = { id: "trash", name: "Trash", icon: "🗑️" };

/** Base icon size in px */
const BASE_SIZE = 48;
/** Max magnified size in px */
const MAX_SIZE = 80;
/** How many neighbors (in px distance) are affected */
const MAGNIFY_RANGE = 150;

/* ------------------------------------------------------------------ */
/*  CSS keyframes injected once                                        */
/* ------------------------------------------------------------------ */

const BOUNCE_KEYFRAMES = `
@keyframes dock-bounce {
  0%   { transform: translateY(0); }
  15%  { transform: translateY(-28px); }
  30%  { transform: translateY(0); }
  45%  { transform: translateY(-16px); }
  60%  { transform: translateY(0); }
  75%  { transform: translateY(-6px); }
  90%  { transform: translateY(0); }
  100% { transform: translateY(0); }
}
`;

/* ------------------------------------------------------------------ */
/*  Parabolic scale helper                                             */
/* ------------------------------------------------------------------ */

function getScale(distance: number): number {
  if (distance > MAGNIFY_RANGE) return 1;
  // Parabolic (cosine-based) curve for smooth falloff
  const ratio = distance / MAGNIFY_RANGE;
  const scale = 1 + (MAX_SIZE / BASE_SIZE - 1) * (0.5 * (Math.cos(Math.PI * ratio) + 1));
  return scale;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Dock({ onOpenApp }: DockProps) {
  const dockRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [bouncingApps, setBouncingApps] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    appId: string;
  } | null>(null);

  const { windows, openWindow, closeWindow, focusWindow } = useDesktopStore();

  // Inject bounce keyframes once
  useEffect(() => {
    const id = "dock-bounce-style";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = BOUNCE_KEYFRAMES;
    document.head.appendChild(style);
  }, []);

  /* ---- Mouse tracking ---- */

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  /* ---- App open logic ---- */

  const handleAppClick = useCallback(
    (app: DockApp) => {
      if (app.id === "trash") return; // Trash does nothing on click for now

      // If caller provides onOpenApp, delegate to it
      if (onOpenApp) {
        // Still check for existing windows first
        const existing = windows.find((w) => w.appId === app.id && !w.minimized);
        if (existing) {
          focusWindow(existing.id);
          return;
        }
        const minimized = windows.find((w) => w.appId === app.id && w.minimized);
        if (minimized) {
          focusWindow(minimized.id);
          return;
        }
        // Bounce animation
        setBouncingApps((prev) => new Set(prev).add(app.id));
        setTimeout(() => {
          setBouncingApps((prev) => {
            const next = new Set(prev);
            next.delete(app.id);
            return next;
          });
        }, 800);
        onOpenApp(app.id);
        return;
      }

      // Fallback: handle internally (backwards compatible)
      const existing = windows.find((w) => w.appId === app.id && !w.minimized);
      if (existing) {
        focusWindow(existing.id);
        return;
      }
      const minimized = windows.find((w) => w.appId === app.id && w.minimized);
      if (minimized) {
        focusWindow(minimized.id);
        return;
      }

      // Bounce
      setBouncingApps((prev) => new Set(prev).add(app.id));
      setTimeout(() => {
        setBouncingApps((prev) => {
          const next = new Set(prev);
          next.delete(app.id);
          return next;
        });
      }, 800);

      const centerX = Math.max(100, (window.innerWidth - 800) / 2);
      const centerY = Math.max(50, (window.innerHeight - 500) / 2);
      const defaults = {
        minimized: false,
        maximized: false,
      };

      const appConfigs: Record<string, Omit<Parameters<typeof openWindow>[0], "appId">> = {
        finder: { title: "Finder", x: centerX, y: centerY, width: 800, height: 500, ...defaults, data: { folderId: null } },
        safari: { title: "Safari", x: centerX, y: centerY, width: 900, height: 600, ...defaults, data: { url: "https://wyattcase.com" } },
        calculator: { title: "Calculator", x: centerX + 200, y: centerY + 50, width: 260, height: 400, ...defaults },
        calendar: { title: "Calendar", x: centerX + 40, y: centerY + 20, width: 700, height: 500, ...defaults },
        notes: { title: "Notes", x: centerX + 80, y: centerY + 40, width: 500, height: 450, ...defaults, data: { content: "" } },
        photos: { title: "Photos", x: centerX + 20, y: centerY + 10, width: 800, height: 550, ...defaults },
        music: { title: "Music", x: centerX + 60, y: centerY + 30, width: 750, height: 500, ...defaults },
        textedit: { title: "Untitled", x: centerX + 50, y: centerY + 30, width: 600, height: 400, ...defaults, data: { content: "", fileId: null } },
        terminal: { title: "Terminal", x: centerX + 30, y: centerY + 20, width: 640, height: 400, ...defaults },
        settings: { title: "System Settings", x: centerX + 60, y: centerY + 20, width: 700, height: 480, ...defaults },
      };

      const config = appConfigs[app.id];
      if (config) {
        openWindow({ appId: app.id, ...config });
      }
    },
    [onOpenApp, windows, focusWindow, openWindow]
  );

  /* ---- Right-click context menu ---- */

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, appId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, appId });
    },
    []
  );

  const handleQuit = useCallback(
    (appId: string) => {
      const appWindows = windows.filter((w) => w.appId === appId);
      appWindows.forEach((w) => closeWindow(w.id));
      setContextMenu(null);
    },
    [windows, closeWindow]
  );

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => setContextMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [contextMenu]);

  /* ---- Minimized windows ---- */

  const minimizedWindows = windows.filter((w) => w.minimized);

  /* ---- Render helpers ---- */

  function renderIcon(
    app: DockApp,
    index: number,
    isBouncing: boolean,
    isRunning: boolean
  ) {
    const refCallback = (el: HTMLDivElement | null) => {
      if (el) {
        iconRefs.current.set(app.id, el);
      } else {
        iconRefs.current.delete(app.id);
      }
    };

    // Calculate scale based on mouse distance
    let scale = 1;
    if (mouseX !== null) {
      const el = iconRefs.current.get(app.id);
      if (el && dockRef.current) {
        const iconRect = el.getBoundingClientRect();
        const dockRect = dockRef.current.getBoundingClientRect();
        const iconCenter = iconRect.left + iconRect.width / 2 - dockRect.left;
        const distance = Math.abs(mouseX - iconCenter);
        scale = getScale(distance);
      }
    }

    const size = BASE_SIZE * scale;
    const translateY = -(size - BASE_SIZE);

    return (
      <div
        key={app.id}
        ref={refCallback}
        className="relative flex flex-col items-center group"
        onContextMenu={(e) => handleContextMenu(e, app.id)}
      >
        {/* Tooltip */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[rgba(30,30,30,0.92)] text-white text-xs font-medium px-2.5 py-1 rounded-md border border-white/20 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ transform: `translateX(-50%) translateY(${translateY}px)` }}
        >
          {app.name}
          {/* Tooltip arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-[rgba(30,30,30,0.92)] border-r border-b border-white/20 rotate-45" />
        </div>

        {/* Icon button */}
        <button
          onClick={() => handleAppClick(app)}
          className="cursor-default transition-none select-none"
          style={{
            fontSize: `${size}px`,
            lineHeight: 1,
            width: `${size}px`,
            height: `${size}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `translateY(${translateY}px)`,
            animation: isBouncing ? "dock-bounce 0.8s ease-out" : undefined,
          }}
        >
          {app.icon}
        </button>

        {/* Running indicator dot */}
        <div
          className="w-1 h-1 rounded-full mt-0.5 transition-opacity duration-200"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            opacity: isRunning ? 1 : 0,
            transform: `translateY(${translateY}px)`,
          }}
        />
      </div>
    );
  }

  function renderMinimizedWindow(win: (typeof windows)[number]) {
    // Calculate scale for minimized thumbnails too
    let scale = 1;
    const thumbId = `minimized-${win.id}`;
    if (mouseX !== null) {
      const el = iconRefs.current.get(thumbId);
      if (el && dockRef.current) {
        const iconRect = el.getBoundingClientRect();
        const dockRect = dockRef.current.getBoundingClientRect();
        const iconCenter = iconRect.left + iconRect.width / 2 - dockRect.left;
        const distance = Math.abs(mouseX - iconCenter);
        scale = getScale(distance);
      }
    }

    const size = BASE_SIZE * scale;
    const translateY = -(size - BASE_SIZE);

    const refCallback = (el: HTMLDivElement | null) => {
      if (el) {
        iconRefs.current.set(thumbId, el);
      } else {
        iconRefs.current.delete(thumbId);
      }
    };

    return (
      <div
        key={win.id}
        ref={refCallback}
        className="relative flex flex-col items-center group"
      >
        {/* Tooltip */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[rgba(30,30,30,0.92)] text-white text-xs font-medium px-2.5 py-1 rounded-md border border-white/20 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          style={{ transform: `translateX(-50%) translateY(${translateY}px)` }}
        >
          {win.title}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-[rgba(30,30,30,0.92)] border-r border-b border-white/20 rotate-45" />
        </div>

        <button
          onClick={() => focusWindow(win.id)}
          className="cursor-default overflow-hidden rounded-md border border-white/20 transition-none select-none"
          style={{
            width: `${size}px`,
            height: `${size * 0.7}px`,
            transform: `translateY(${translateY}px)`,
            background: "linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)",
          }}
        >
          <div className="w-full h-full flex items-center justify-center text-white/40 text-[10px] leading-tight px-1 truncate">
            {win.title}
          </div>
        </button>

        <div
          className="w-1 h-1 rounded-full mt-0.5"
          style={{ opacity: 0, transform: `translateY(${translateY}px)` }}
        />
      </div>
    );
  }

  /* ---- Context menu overlay ---- */

  function renderContextMenu() {
    if (!contextMenu) return null;

    const isRunning = windows.some((w) => w.appId === contextMenu.appId);
    const appName =
      DOCK_APPS.find((a) => a.id === contextMenu.appId)?.name ??
      TRASH_APP.id === contextMenu.appId
        ? TRASH_APP.name
        : contextMenu.appId;

    return (
      <div
        className="fixed inset-0 z-[10001]"
        onClick={() => setContextMenu(null)}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu(null);
        }}
      >
        <div
          className="absolute bg-[rgba(40,40,40,0.95)] backdrop-blur-xl rounded-lg border border-white/20 py-1 shadow-2xl min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y - 10, transform: "translateY(-100%)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* New Window */}
          <button
            className="w-full text-left px-3 py-1 text-sm text-white/90 hover:bg-blue-500/80 hover:text-white transition-colors"
            onClick={() => {
              handleAppClick(
                DOCK_APPS.find((a) => a.id === contextMenu.appId) ?? TRASH_APP
              );
              setContextMenu(null);
            }}
          >
            New Window
          </button>

          {/* Separator */}
          <div className="h-px bg-white/10 my-1" />

          {/* Options submenu (simplified) */}
          <div className="relative group/options">
            <button className="w-full text-left px-3 py-1 text-sm text-white/90 hover:bg-blue-500/80 hover:text-white transition-colors flex items-center justify-between">
              Options
              <span className="text-white/40 text-xs ml-4">&#9654;</span>
            </button>
            <div className="absolute left-full top-0 ml-0.5 bg-[rgba(40,40,40,0.95)] backdrop-blur-xl rounded-lg border border-white/20 py-1 shadow-2xl min-w-[160px] hidden group-hover/options:block">
              <button className="w-full text-left px-3 py-1 text-sm text-white/90 hover:bg-blue-500/80 hover:text-white transition-colors flex items-center gap-2">
                <span className="text-xs">✓</span> Keep in Dock
              </button>
            </div>
          </div>

          {/* Separator */}
          <div className="h-px bg-white/10 my-1" />

          {/* Quit */}
          {isRunning && (
            <button
              className="w-full text-left px-3 py-1 text-sm text-white/90 hover:bg-blue-500/80 hover:text-white transition-colors"
              onClick={() => handleQuit(contextMenu.appId)}
            >
              Quit {appName}
            </button>
          )}
          {!isRunning && (
            <button
              className="w-full text-left px-3 py-1 text-sm text-white/30 cursor-default"
              disabled
            >
              Quit {appName}
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ---- Main render ---- */

  return (
    <>
      <div
        ref={dockRef}
        className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[9998] flex items-end px-2.5 pb-1.5 pt-1 bg-[rgba(30,30,30,0.55)] backdrop-blur-2xl rounded-2xl border border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* App icons */}
        {DOCK_APPS.map((app, i) => {
          const isRunning = windows.some((w) => w.appId === app.id);
          const isBouncing = bouncingApps.has(app.id);
          return renderIcon(app, i, isBouncing, isRunning);
        })}

        {/* Separator */}
        <div className="flex items-end mx-1 pb-1" style={{ height: `${BASE_SIZE}px` }}>
          <div className="w-px h-8 bg-white/20 rounded-full" />
        </div>

        {/* Minimized windows */}
        {minimizedWindows.map((win) => renderMinimizedWindow(win))}

        {/* Trash (always last) */}
        {renderIcon(
          TRASH_APP,
          DOCK_APPS.length + minimizedWindows.length + 1,
          bouncingApps.has(TRASH_APP.id),
          false
        )}
      </div>

      {/* Right-click context menu */}
      {renderContextMenu()}
    </>
  );
}
