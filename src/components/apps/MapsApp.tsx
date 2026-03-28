"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { WindowState } from "@/lib/types";

interface Props {
  window: WindowState;
}

const NEIGHBORHOODS = [
  { name: "Downtown", x: 48, y: 45 },
  { name: "Midtown", x: 30, y: 30 },
  { name: "Uptown", x: 65, y: 25 },
  { name: "Westside", x: 20, y: 55 },
  { name: "Eastside", x: 75, y: 55 },
  { name: "Old Town", x: 55, y: 70 },
  { name: "Harbor", x: 40, y: 80 },
  { name: "University", x: 70, y: 35 },
];

const FAVORITES = [
  { name: "Home", icon: "🏠", address: "1234 Oak Street" },
  { name: "Work", icon: "💼", address: "567 Market Ave" },
];

const RECENTS = [
  { name: "Golden Gate Park", time: "Yesterday" },
  { name: "Ferry Building", time: "2 days ago" },
  { name: "Twin Peaks", time: "Last week" },
];

const GUIDES = [
  { name: "Top Coffee Shops", count: 12 },
  { name: "Best Viewpoints", count: 8 },
  { name: "Historic Sites", count: 15 },
];

export default function MapsApp({ window: win }: Props) {
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [useIframe, setUseIframe] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [centerLat] = useState(37.7749);
  const [centerLng] = useState(-122.4194);
  const [compassRotation] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Detect iframe load failure
  useEffect(() => {
    const timer = setTimeout(() => {
      // If after 3s we suspect iframe might be blocked, keep showing it
      // but have fallback ready
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.3, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.3, 0.5));
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (search.trim()) {
        // In a real app this would geocode and pan
        setSearch("");
      }
    },
    [search],
  );

  const toggleMapMode = useCallback(() => {
    setUseIframe((prev) => !prev);
    setIframeError(false);
  }, []);

  const showFallback = !useIframe || iframeError;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white overflow-hidden select-none">
      {/* Top Search Bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#2a2a2a] border-b border-[#3a3a3a] shrink-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded hover:bg-[#3a3a3a] text-[#999] transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <rect x="1" y="3" width="14" height="1.5" rx="0.75" />
            <rect x="1" y="7.25" width="14" height="1.5" rx="0.75" />
            <rect x="1" y="11.5" width="14" height="1.5" rx="0.75" />
          </svg>
        </button>
        <form onSubmit={handleSearch} className="flex-1 flex">
          <div className="relative flex-1">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#666]"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85zm-5.44.856a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Maps"
              className="w-full bg-[#1a1a1a] text-white text-sm rounded-lg pl-8 pr-3 py-1.5 border border-[#3a3a3a] focus:border-blue-500 focus:outline-none placeholder-[#666]"
            />
          </div>
        </form>
        <button
          onClick={toggleMapMode}
          className="px-2 py-1 text-xs rounded bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#aaa] transition-colors"
          title={showFallback ? "Try OpenStreetMap" : "Use styled map"}
        >
          {showFallback ? "OSM" : "Styled"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-56 bg-[#252525] border-r border-[#3a3a3a] overflow-y-auto shrink-0">
            {/* Favorites */}
            <div className="p-3 border-b border-[#333]">
              <h3 className="text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-2">
                Favorites
              </h3>
              {FAVORITES.map((fav) => (
                <button
                  key={fav.name}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-[#333] text-left transition-colors"
                >
                  <span className="text-base">{fav.icon}</span>
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">
                      {fav.name}
                    </div>
                    <div className="text-[11px] text-[#666] truncate">
                      {fav.address}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Recents */}
            <div className="p-3 border-b border-[#333]">
              <h3 className="text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-2">
                Recents
              </h3>
              {RECENTS.map((item) => (
                <button
                  key={item.name}
                  className="flex items-center justify-between w-full px-2 py-1.5 rounded hover:bg-[#333] text-left transition-colors"
                >
                  <span className="text-sm text-white truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-[#555] shrink-0 ml-2">
                    {item.time}
                  </span>
                </button>
              ))}
            </div>

            {/* Guides */}
            <div className="p-3">
              <h3 className="text-[11px] font-semibold text-[#888] uppercase tracking-wider mb-2">
                Guides
              </h3>
              {GUIDES.map((guide) => (
                <button
                  key={guide.name}
                  className="flex items-center justify-between w-full px-2 py-1.5 rounded hover:bg-[#333] text-left transition-colors"
                >
                  <span className="text-sm text-white truncate">
                    {guide.name}
                  </span>
                  <span className="text-[10px] text-[#555] bg-[#333] px-1.5 py-0.5 rounded-full shrink-0 ml-2">
                    {guide.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Map Area */}
        <div className="flex-1 relative min-w-0">
          {showFallback ? (
            /* Styled Map Placeholder */
            <div
              ref={mapRef}
              className="w-full h-full overflow-hidden relative bg-[#1a2332]"
            >
              <div
                className="absolute inset-0 transition-transform duration-200 origin-center"
                style={{ transform: `scale(${zoom})` }}
              >
                {/* Water features */}
                <div className="absolute bottom-0 right-0 w-[40%] h-[30%] bg-[#1a3550] rounded-tl-[60%] opacity-60" />
                <div className="absolute top-0 left-0 w-[15%] h-[20%] bg-[#1a3550] rounded-br-[80%] opacity-40" />

                {/* Major roads - horizontal */}
                <div className="absolute top-[20%] left-0 right-0 h-[3px] bg-[#2a3a4a]" />
                <div className="absolute top-[40%] left-0 right-0 h-[4px] bg-[#3a4a5a]" />
                <div className="absolute top-[60%] left-0 right-0 h-[3px] bg-[#2a3a4a]" />
                <div className="absolute top-[80%] left-[10%] right-[20%] h-[3px] bg-[#2a3a4a]" />

                {/* Major roads - vertical */}
                <div className="absolute left-[25%] top-0 bottom-0 w-[3px] bg-[#2a3a4a]" />
                <div className="absolute left-[50%] top-0 bottom-[25%] w-[4px] bg-[#3a4a5a]" />
                <div className="absolute left-[75%] top-[10%] bottom-[30%] w-[3px] bg-[#2a3a4a]" />

                {/* Minor streets grid - horizontal */}
                {[10, 15, 25, 30, 35, 45, 50, 55, 65, 70, 75, 85, 90].map(
                  (y) => (
                    <div
                      key={`h-${y}`}
                      className="absolute left-0 right-0 h-px bg-[#232f3d]"
                      style={{ top: `${y}%` }}
                    />
                  ),
                )}

                {/* Minor streets grid - vertical */}
                {[10, 15, 20, 30, 35, 40, 45, 55, 60, 65, 70, 80, 85, 90].map(
                  (x) => (
                    <div
                      key={`v-${x}`}
                      className="absolute top-0 bottom-0 w-px bg-[#232f3d]"
                      style={{ left: `${x}%` }}
                    />
                  ),
                )}

                {/* Parks */}
                <div className="absolute top-[22%] left-[32%] w-[12%] h-[14%] bg-[#1a3a2a] rounded-lg opacity-70" />
                <div className="absolute top-[62%] left-[60%] w-[8%] h-[10%] bg-[#1a3a2a] rounded-full opacity-50" />

                {/* Diagonal avenue */}
                <div
                  className="absolute top-[10%] left-[10%] w-[70%] h-[3px] bg-[#2e3f50] origin-left"
                  style={{ transform: "rotate(35deg)" }}
                />

                {/* Neighborhood labels */}
                {NEIGHBORHOODS.map((n) => (
                  <div
                    key={n.name}
                    className="absolute text-[10px] font-medium tracking-widest uppercase text-[#4a6070] pointer-events-none whitespace-nowrap"
                    style={{
                      left: `${n.x}%`,
                      top: `${n.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {n.name}
                  </div>
                ))}

                {/* Center pin marker */}
                <div
                  className="absolute z-10"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <div className="relative">
                    <svg
                      width="28"
                      height="38"
                      viewBox="0 0 28 38"
                      fill="none"
                    >
                      <path
                        d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z"
                        fill="#e74c3c"
                      />
                      <circle cx="14" cy="14" r="6" fill="white" />
                      <circle cx="14" cy="14" r="3" fill="#e74c3c" />
                    </svg>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/30 rounded-full blur-[2px]" />
                  </div>
                </div>

                {/* Secondary pins */}
                {[
                  { x: 32, y: 28, color: "#3498db" },
                  { x: 65, y: 52, color: "#2ecc71" },
                  { x: 42, y: 68, color: "#f39c12" },
                ].map((pin, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      transform: "translate(-50%, -100%)",
                    }}
                  >
                    <svg
                      width="18"
                      height="24"
                      viewBox="0 0 28 38"
                      fill="none"
                    >
                      <path
                        d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z"
                        fill={pin.color}
                      />
                      <circle cx="14" cy="14" r="5" fill="white" />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* OpenStreetMap iframe */
            <iframe
              ref={iframeRef}
              title="OpenStreetMap"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=-122.5149%2C37.7049%2C-122.3549%2C37.8149&layer=mapnik&marker=${centerLat}%2C${centerLng}`}
              className="w-full h-full border-0"
              onError={() => setIframeError(true)}
              loading="lazy"
            />
          )}

          {/* Map Controls - right side */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            {/* Compass */}
            <button
              className="w-9 h-9 bg-[#2a2a2a]/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-[#3a3a3a]/90 border border-[#444] transition-colors shadow-lg"
              title="Reset compass"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 20 20"
                style={{ transform: `rotate(${compassRotation}deg)` }}
              >
                <polygon points="10,2 12,9 10,8 8,9" fill="#e74c3c" />
                <polygon points="10,18 8,11 10,12 12,11" fill="#ccc" />
              </svg>
            </button>

            {/* Zoom controls */}
            <div className="flex flex-col bg-[#2a2a2a]/90 backdrop-blur-sm rounded-lg border border-[#444] overflow-hidden shadow-lg">
              <button
                onClick={handleZoomIn}
                className="w-9 h-8 flex items-center justify-center hover:bg-[#3a3a3a]/90 text-white text-lg font-light transition-colors"
                aria-label="Zoom in"
              >
                +
              </button>
              <div className="h-px bg-[#444]" />
              <button
                onClick={handleZoomOut}
                className="w-9 h-8 flex items-center justify-center hover:bg-[#3a3a3a]/90 text-white text-lg font-light transition-colors"
                aria-label="Zoom out"
              >
                -
              </button>
            </div>

            {/* Current location */}
            <button
              className="w-9 h-9 bg-[#2a2a2a]/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-[#3a3a3a]/90 border border-[#444] transition-colors shadow-lg"
              title="Current location"
              aria-label="Current location"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="8" cy="8" r="3" />
                <line x1="8" y1="0.5" x2="8" y2="3" />
                <line x1="8" y1="13" x2="8" y2="15.5" />
                <line x1="0.5" y1="8" x2="3" y2="8" />
                <line x1="13" y1="8" x2="15.5" y2="8" />
              </svg>
            </button>
          </div>

          {/* Scale bar - bottom left */}
          <div className="absolute bottom-10 left-3 z-10 flex items-end gap-1">
            <div className="flex flex-col items-start">
              <span className="text-[9px] text-white/70 mb-0.5">
                {Math.round(500 / zoom)} m
              </span>
              <div className="w-16 h-[2px] bg-white/60 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#2a2a2a] border-t border-[#3a3a3a] text-[11px] text-[#888] shrink-0">
        <div className="flex items-center gap-3">
          <span>
            {centerLat.toFixed(4)}° N, {Math.abs(centerLng).toFixed(4)}° W
          </span>
          <span className="text-[#555]">|</span>
          <span>Zoom: {zoom.toFixed(1)}x</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#555]">
            {showFallback ? "Styled Map" : "OpenStreetMap"}
          </span>
          <span className="text-[#555]">|</span>
          <span>San Francisco, CA</span>
        </div>
      </div>
    </div>
  );
}
