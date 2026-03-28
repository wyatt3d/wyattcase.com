"use client";

import { useState, useCallback } from "react";
import { useDesktopStore } from "@/lib/store";

interface DockApp {
  id: string;
  name: string;
  icon: string;
}

const DOCK_APPS: DockApp[] = [
  { id: "finder", name: "Finder", icon: "📁" },
  { id: "textedit", name: "TextEdit", icon: "📝" },
  { id: "terminal", name: "Terminal", icon: "🖥️" },
  { id: "safari", name: "Safari", icon: "🧭" },
  { id: "notes", name: "Notes", icon: "📒" },
  { id: "photos", name: "Photos", icon: "🖼️" },
  { id: "settings", name: "Settings", icon: "⚙️" },
  { id: "trash", name: "Trash", icon: "🗑️" },
];

export default function Dock() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { openWindow, windows, focusWindow } = useDesktopStore();

  const handleAppClick = useCallback(
    (app: DockApp) => {
      // Check if already open
      const existing = windows.find(
        (w) => w.appId === app.id && !w.minimized
      );
      if (existing) {
        focusWindow(existing.id);
        return;
      }

      // Restore minimized
      const minimized = windows.find(
        (w) => w.appId === app.id && w.minimized
      );
      if (minimized) {
        focusWindow(minimized.id);
        return;
      }

      // Open new window
      const centerX = Math.max(100, (window.innerWidth - 800) / 2);
      const centerY = Math.max(50, (window.innerHeight - 500) / 2);

      if (app.id === "finder") {
        openWindow({
          appId: "finder",
          title: "Finder",
          x: centerX,
          y: centerY,
          width: 800,
          height: 500,
          minimized: false,
          maximized: false,
          data: { folderId: null },
        });
      } else if (app.id === "textedit") {
        openWindow({
          appId: "textedit",
          title: "Untitled",
          x: centerX + 50,
          y: centerY + 30,
          width: 600,
          height: 400,
          minimized: false,
          maximized: false,
          data: { content: "", fileId: null },
        });
      } else if (app.id === "terminal") {
        openWindow({
          appId: "terminal",
          title: "Terminal",
          x: centerX + 30,
          y: centerY + 20,
          width: 640,
          height: 400,
          minimized: false,
          maximized: false,
        });
      } else if (app.id === "safari") {
        openWindow({
          appId: "safari",
          title: "Safari",
          x: centerX,
          y: centerY,
          width: 900,
          height: 600,
          minimized: false,
          maximized: false,
          data: { url: "https://wyattcase.com" },
        });
      } else if (app.id === "notes") {
        openWindow({
          appId: "notes",
          title: "Notes",
          x: centerX + 80,
          y: centerY + 40,
          width: 500,
          height: 450,
          minimized: false,
          maximized: false,
          data: { content: "" },
        });
      } else if (app.id === "settings") {
        openWindow({
          appId: "settings",
          title: "System Settings",
          x: centerX + 60,
          y: centerY + 20,
          width: 700,
          height: 480,
          minimized: false,
          maximized: false,
        });
      }
    },
    [openWindow, windows, focusWindow]
  );

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[9998] flex items-end gap-1 px-3 py-1.5 bg-[rgba(30,30,30,0.65)] backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl">
      {DOCK_APPS.map((app) => {
        const isHovered = hoveredId === app.id;
        const isOpen = windows.some((w) => w.appId === app.id);
        return (
          <div
            key={app.id}
            className="flex flex-col items-center"
            onMouseEnter={() => setHoveredId(app.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Tooltip */}
            {isHovered && (
              <div className="absolute -top-8 bg-[rgba(30,30,30,0.9)] text-white text-xs px-2 py-1 rounded-md border border-white/20 whitespace-nowrap">
                {app.name}
              </div>
            )}
            <button
              onClick={() => handleAppClick(app)}
              className="text-[40px] leading-none transition-transform duration-200 ease-out cursor-default"
              style={{
                transform: isHovered ? "scale(1.35) translateY(-8px)" : "scale(1)",
              }}
            >
              {app.icon}
            </button>
            {/* Running indicator dot */}
            {isOpen && (
              <div className="w-1 h-1 rounded-full bg-white/60 mt-0.5" />
            )}
          </div>
        );
      })}
    </div>
  );
}
