"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDesktopStore } from "@/lib/store";

interface SpotlightProps {
  visible: boolean;
  onClose: () => void;
  onOpenApp: (appId: string) => void;
  onOpenItem: (itemId: string) => void;
}

interface SearchResult {
  id: string;
  label: string;
  icon: string;
  category: "top" | "files" | "apps" | "suggestions";
  action: () => void;
}

const APPS = [
  { id: "finder", name: "Finder", icon: "📁" },
  { id: "textedit", name: "TextEdit", icon: "📝" },
  { id: "terminal", name: "Terminal", icon: "🖥️" },
  { id: "safari", name: "Safari", icon: "🧭" },
  { id: "notes", name: "Notes", icon: "📒" },
  { id: "photos", name: "Photos", icon: "🖼️" },
  { id: "calculator", name: "Calculator", icon: "🧮" },
  { id: "settings", name: "Settings", icon: "⚙️" },
  { id: "trash", name: "Trash", icon: "🗑️" },
];

const CATEGORY_LABELS: Record<string, string> = {
  top: "Top Hit",
  files: "Files & Folders",
  apps: "Apps",
  suggestions: "Suggestions",
};

export default function Spotlight({
  visible,
  onClose,
  onOpenApp,
  onOpenItem,
}: SpotlightProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const items = useDesktopStore((s) => s.items);

  // Reset state when opening
  useEffect(() => {
    if (visible) {
      setQuery("");
      setSelectedIndex(0);
      // Small delay so the DOM is painted before focusing
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const results = useMemo((): SearchResult[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matched: SearchResult[] = [];

    // Search files & folders
    const fileMatches = items.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
    for (const item of fileMatches) {
      matched.push({
        id: `file-${item.id}`,
        label: item.name,
        icon: item.type === "folder" ? "📁" : "📄",
        category: "files",
        action: () => onOpenItem(item.id),
      });
    }

    // Search apps
    const appMatches = APPS.filter((app) =>
      app.name.toLowerCase().includes(q)
    );
    for (const app of appMatches) {
      matched.push({
        id: `app-${app.id}`,
        label: app.name,
        icon: app.icon,
        category: "apps",
        action: () => onOpenApp(app.id),
      });
    }

    // Always add a web suggestion
    matched.push({
      id: "suggestion-web",
      label: `Search the web for "${query.trim()}"`,
      icon: "🔍",
      category: "suggestions",
      action: () => {
        onOpenApp("safari");
        onClose();
      },
    });

    // Promote the first match to "Top Hit"
    const topHitSource = appMatches[0] ?? fileMatches[0];
    if (topHitSource) {
      const isApp = appMatches[0] === topHitSource;
      matched.unshift({
        id: "top-hit",
        label: isApp
          ? (topHitSource as (typeof APPS)[number]).name
          : (topHitSource as (typeof items)[number]).name,
        icon: isApp
          ? (topHitSource as (typeof APPS)[number]).icon
          : (topHitSource as (typeof items)[number]).type === "folder"
            ? "📁"
            : "📄",
        category: "top",
        action: isApp
          ? () => onOpenApp((topHitSource as (typeof APPS)[number]).id)
          : () => onOpenItem((topHitSource as (typeof items)[number]).id),
      });
    }

    return matched;
  }, [query, items, onOpenApp, onOpenItem, onClose]);

  // Clamp selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  // Scroll selected item into view
  useEffect(() => {
    if (!resultsRef.current) return;
    const el = resultsRef.current.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          selected.action();
          onClose();
        }
        return;
      }
    },
    [results, selectedIndex, onClose]
  );

  if (!visible) return null;

  // Group results by category for rendering
  const grouped: { category: string; items: (SearchResult & { flatIdx: number })[] }[] = [];
  const categoryOrder = ["top", "files", "apps", "suggestions"];
  let flatIdx = 0;

  for (const cat of categoryOrder) {
    const catItems = results
      .filter((r) => r.category === cat)
      .map((r) => {
        const item = { ...r, flatIdx };
        flatIdx++;
        return item;
      });
    if (catItems.length > 0) {
      grouped.push({ category: cat, items: catItems });
    }
  }

  return (
    <div
      className="fixed inset-0 z-[10000] flex justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/25" />

      {/* Spotlight container */}
      <div
        className="relative w-full max-w-[680px] h-fit"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 bg-[rgba(30,30,30,0.82)] backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl">
          {/* Magnifying glass */}
          <svg
            className="w-6 h-6 text-white/50 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent text-white text-xl font-light outline-none placeholder:text-white/40 caret-white"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div
            ref={resultsRef}
            className="mt-2 max-h-[50vh] overflow-y-auto rounded-2xl bg-[rgba(30,30,30,0.82)] backdrop-blur-2xl border border-white/20 shadow-2xl"
          >
            {grouped.map((group) => (
              <div key={group.category}>
                {/* Category header */}
                <div className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-wide text-white/40 uppercase">
                  {CATEGORY_LABELS[group.category]}
                </div>
                {group.items.map((result) => {
                  const isSelected = result.flatIdx === selectedIndex;
                  return (
                    <button
                      key={result.id}
                      data-index={result.flatIdx}
                      className={`flex items-center gap-3 w-full px-4 py-2 text-left cursor-default transition-colors ${
                        isSelected
                          ? "bg-blue-500/70 text-white"
                          : "text-white/80 hover:bg-white/10"
                      }`}
                      onClick={() => {
                        result.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(result.flatIdx)}
                    >
                      <span className="text-2xl leading-none w-8 text-center flex-shrink-0">
                        {result.icon}
                      </span>
                      <span
                        className={`text-sm truncate ${
                          isSelected ? "font-medium" : ""
                        }`}
                      >
                        {result.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
