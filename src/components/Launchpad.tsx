"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface LaunchpadApp {
  id: string;
  name: string;
  icon: string;
}

const LAUNCHPAD_APPS: LaunchpadApp[] = [
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
  { id: "maps", name: "Maps", icon: "🗺️" },
  { id: "weather", name: "Weather", icon: "🌤️" },
  { id: "appstore", name: "App Store", icon: "🏪" },
  { id: "mail", name: "Mail", icon: "✉️" },
  { id: "contacts", name: "Contacts", icon: "👤" },
  { id: "messages", name: "Messages", icon: "💬" },
  { id: "facetime", name: "FaceTime", icon: "📹" },
  { id: "reminders", name: "Reminders", icon: "☑️" },
  { id: "clock", name: "Clock", icon: "🕐" },
  { id: "books", name: "Books", icon: "📚" },
  { id: "stocks", name: "Stocks", icon: "📈" },
];

interface LaunchpadProps {
  visible: boolean;
  onClose: () => void;
  onOpenApp: (appId: string) => void;
}

export default function Launchpad({ visible, onClose, onOpenApp }: LaunchpadProps) {
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Handle mount/unmount animation
  useEffect(() => {
    if (visible) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimating(true);
        });
      });
      // Focus search on open
      setTimeout(() => searchRef.current?.focus(), 100);
    } else {
      setAnimating(false);
      const timer = setTimeout(() => {
        setMounted(false);
        setSearch("");
        setHoveredId(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Close on Escape
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visible, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) {
        onClose();
      }
    },
    [onClose]
  );

  const handleAppClick = useCallback(
    (appId: string) => {
      onOpenApp(appId);
      onClose();
    },
    [onOpenApp, onClose]
  );

  const filteredApps = search.trim()
    ? LAUNCHPAD_APPS.filter((app) =>
        app.name.toLowerCase().includes(search.toLowerCase())
      )
    : LAUNCHPAD_APPS;

  if (!mounted) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[9999] flex flex-col items-center transition-all duration-300 ease-out"
      style={{
        backdropFilter: animating ? "blur(40px) saturate(180%)" : "blur(0px) saturate(100%)",
        WebkitBackdropFilter: animating ? "blur(40px) saturate(180%)" : "blur(0px) saturate(100%)",
        backgroundColor: animating ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0)",
        opacity: animating ? 1 : 0,
      }}
    >
      {/* Search bar */}
      <div className="mt-12 mb-8">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-64 pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 outline-none focus:bg-white/15 focus:border-white/30 transition-colors"
          />
        </div>
      </div>

      {/* App grid */}
      <div className="flex-1 flex items-start justify-center w-full px-16 overflow-hidden">
        <div
          className="grid gap-y-8 gap-x-6 justify-items-center transition-transform duration-300"
          style={{
            gridTemplateColumns: "repeat(7, 80px)",
            transform: animating ? "scale(1)" : "scale(1.1)",
          }}
        >
          {filteredApps.map((app) => {
            const isHovered = hoveredId === app.id;
            return (
              <button
                key={app.id}
                onClick={() => handleAppClick(app.id)}
                onMouseEnter={() => setHoveredId(app.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="flex flex-col items-center gap-1.5 w-20 cursor-default group"
              >
                <span
                  className="text-5xl leading-none transition-transform duration-150 ease-out"
                  style={{
                    transform: isHovered ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  {app.icon}
                </span>
                <span className="text-white text-xs font-medium truncate w-full text-center drop-shadow-md">
                  {app.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page dots */}
      <div className="mb-8 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-white/90" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
      </div>
    </div>
  );
}
