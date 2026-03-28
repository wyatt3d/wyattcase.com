"use client";

import { useState, useCallback } from "react";
import type { WindowState } from "@/lib/types";

interface Props {
  window: WindowState;
}

// --- Data ---

interface AppEntry {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  rating: number;
  price: string | null; // null = free
  gradient: string;
  icon: string;
}

const apps: AppEntry[] = [
  // Productivity
  {
    id: "focus-timer",
    name: "Focus Timer",
    subtitle: "Stay productive, stay focused",
    category: "Productivity",
    rating: 4.8,
    price: null,
    gradient: "from-orange-500 to-red-500",
    icon: "⏱",
  },
  {
    id: "markdown-pro",
    name: "Markdown Pro",
    subtitle: "Beautiful writing, beautiful output",
    category: "Productivity",
    rating: 4.6,
    price: "$4.99",
    gradient: "from-blue-500 to-indigo-600",
    icon: "✍️",
  },
  {
    id: "git-dashboard",
    name: "Git Dashboard",
    subtitle: "All your repos at a glance",
    category: "Productivity",
    rating: 4.5,
    price: null,
    gradient: "from-gray-700 to-gray-900",
    icon: "📊",
  },
  // Developer
  {
    id: "code-palette",
    name: "Code Palette",
    subtitle: "Theme editor for every IDE",
    category: "Developer Tools",
    rating: 4.7,
    price: "$2.99",
    gradient: "from-purple-500 to-pink-500",
    icon: "🎨",
  },
  {
    id: "api-inspector",
    name: "API Inspector",
    subtitle: "Debug requests in real time",
    category: "Developer Tools",
    rating: 4.4,
    price: null,
    gradient: "from-green-500 to-teal-500",
    icon: "🔍",
  },
  {
    id: "terminal-plus",
    name: "Terminal Plus",
    subtitle: "Your terminal, supercharged",
    category: "Developer Tools",
    rating: 4.9,
    price: "$9.99",
    gradient: "from-zinc-600 to-zinc-900",
    icon: "⌨️",
  },
  // Creative
  {
    id: "pixel-canvas",
    name: "Pixel Canvas",
    subtitle: "Pixel art made simple",
    category: "Graphics & Design",
    rating: 4.3,
    price: null,
    gradient: "from-pink-400 to-rose-600",
    icon: "🖼",
  },
  {
    id: "sound-studio",
    name: "Sound Studio",
    subtitle: "Record, edit, produce",
    category: "Music",
    rating: 4.6,
    price: "$14.99",
    gradient: "from-violet-500 to-purple-700",
    icon: "🎵",
  },
  {
    id: "color-picker",
    name: "Color Picker",
    subtitle: "Pick any color, anywhere",
    category: "Graphics & Design",
    rating: 4.8,
    price: null,
    gradient: "from-yellow-400 to-orange-500",
    icon: "🌈",
  },
];

const sidebarItems = [
  { id: "discover", label: "Discover", icon: "🌟" },
  { id: "arcade", label: "Arcade", icon: "🕹" },
  { id: "create", label: "Create", icon: "🎨" },
  { id: "work", label: "Work", icon: "💼" },
  { id: "play", label: "Play", icon: "🎮" },
  { id: "develop", label: "Develop", icon: "🛠" },
  { id: "categories", label: "Categories", icon: "📂" },
  { id: "updates", label: "Updates", icon: "🔄" },
];

// --- Sub-components ---

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-px text-[10px] text-yellow-400">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < full ? "opacity-100" : i === full && half ? "opacity-60" : "opacity-25"}>
          ★
        </span>
      ))}
    </span>
  );
}

function AppIcon({ app, size = "md" }: { app: AppEntry; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8 text-base rounded-lg",
    md: "w-12 h-12 text-xl rounded-xl",
    lg: "w-16 h-16 text-3xl rounded-2xl",
  };
  return (
    <div
      className={`bg-gradient-to-br ${app.gradient} ${sizeClasses[size]} flex shrink-0 items-center justify-center shadow-md`}
    >
      {app.icon}
    </div>
  );
}

function GetButton({ price, onClick }: { price: string | null; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full bg-blue-600/90 px-4 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
    >
      {price ?? "GET"}
    </button>
  );
}

// --- Main Component ---

export default function AppStoreApp({ window: win }: Props) {
  const [activeSection, setActiveSection] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSectionClick = useCallback((id: string) => {
    setActiveSection(id);
  }, []);

  const filteredApps = searchQuery
    ? apps.filter(
        (a) =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : apps;

  const freeApps = filteredApps.filter((a) => a.price === null);
  const paidApps = filteredApps.filter((a) => a.price !== null);
  const featured = apps[5]; // Terminal Plus as featured

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#1c1c1e] text-white">
      {/* Sidebar */}
      <aside className="flex w-48 shrink-0 flex-col border-r border-white/10 bg-[#2c2c2e]">
        {/* Search */}
        <div className="p-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1.5">
            <span className="text-xs text-white/40">🔎</span>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-white/40 outline-none"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 pb-3">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSectionClick(item.id)}
              className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition-colors ${
                activeSection === item.id
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Featured Banner */}
          <div
            className={`relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br ${featured.gradient} p-8`}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 flex items-center gap-6">
              <AppIcon app={featured} size="lg" />
              <div className="flex-1">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/70">
                  App of the Day
                </p>
                <h2 className="mb-1 text-2xl font-bold">{featured.name}</h2>
                <p className="mb-3 text-sm text-white/80">{featured.subtitle}</p>
                <GetButton price={featured.price} />
              </div>
            </div>
          </div>

          {/* New & Noteworthy */}
          <section className="mb-8">
            <h3 className="mb-4 text-xl font-bold">New &amp; Noteworthy</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="flex w-44 shrink-0 flex-col rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10"
                >
                  <AppIcon app={app} size="md" />
                  <h4 className="mt-2.5 truncate text-sm font-semibold">{app.name}</h4>
                  <p className="truncate text-xs text-white/50">{app.subtitle}</p>
                  <p className="mt-0.5 text-[11px] text-white/40">{app.category}</p>
                  <div className="mt-1">
                    <Stars rating={app.rating} />
                  </div>
                  <div className="mt-auto pt-2.5">
                    <GetButton price={app.price} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Top Free / Top Paid side by side */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Top Free Apps */}
            <section>
              <h3 className="mb-4 text-xl font-bold">Top Free Apps</h3>
              <div className="flex flex-col gap-2">
                {freeApps.map((app, idx) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10"
                  >
                    <span className="w-5 text-right text-sm font-bold text-white/40">{idx + 1}</span>
                    <AppIcon app={app} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{app.name}</p>
                      <p className="truncate text-xs text-white/50">{app.category}</p>
                    </div>
                    <GetButton price={null} />
                  </div>
                ))}
              </div>
            </section>

            {/* Top Paid Apps */}
            <section>
              <h3 className="mb-4 text-xl font-bold">Top Paid Apps</h3>
              <div className="flex flex-col gap-2">
                {paidApps.map((app, idx) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 transition-colors hover:bg-white/10"
                  >
                    <span className="w-5 text-right text-sm font-bold text-white/40">{idx + 1}</span>
                    <AppIcon app={app} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{app.name}</p>
                      <p className="truncate text-xs text-white/50">{app.category}</p>
                    </div>
                    <GetButton price={app.price} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
