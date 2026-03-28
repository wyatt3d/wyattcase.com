"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { WindowState } from "@/lib/types";

interface Props {
  window: WindowState;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSec: number;
  gradient: string;
}

const TRACKS: Track[] = [
  { id: "1", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20", durationSec: 200, gradient: "from-red-500 to-orange-500" },
  { id: "2", title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", duration: "4:03", durationSec: 243, gradient: "from-indigo-600 to-purple-500" },
  { id: "3", title: "Redbone", artist: "Childish Gambino", album: "Awaken, My Love!", duration: "5:26", durationSec: 326, gradient: "from-amber-600 to-red-700" },
  { id: "4", title: "Electric Feel", artist: "MGMT", album: "Oracular Spectacular", duration: "3:49", durationSec: 229, gradient: "from-cyan-400 to-blue-600" },
  { id: "5", title: "Starboy", artist: "The Weeknd", album: "Starboy", duration: "3:50", durationSec: 230, gradient: "from-yellow-400 to-red-500" },
  { id: "6", title: "Do I Wanna Know?", artist: "Arctic Monkeys", album: "AM", duration: "4:32", durationSec: 272, gradient: "from-gray-700 to-gray-900" },
  { id: "7", title: "Feels Like We Only Go Backwards", artist: "Tame Impala", album: "Lonerism", duration: "3:12", durationSec: 192, gradient: "from-pink-500 to-violet-600" },
  { id: "8", title: "Motion Sickness", artist: "Phoebe Bridgers", album: "Stranger in the Alps", duration: "3:48", durationSec: 228, gradient: "from-slate-400 to-blue-300" },
  { id: "9", title: "Heat Waves", artist: "Glass Animals", album: "Dreamland", duration: "3:58", durationSec: 238, gradient: "from-orange-400 to-pink-500" },
  { id: "10", title: "Myth", artist: "Beach House", album: "Bloom", duration: "4:18", durationSec: 258, gradient: "from-teal-400 to-emerald-600" },
];

type PlaylistKey = "library" | "recently-added" | "favorites" | "recently-played";

const PLAYLISTS: Record<PlaylistKey, { label: string; trackIds: string[] }> = {
  library: { label: "Library", trackIds: TRACKS.map((t) => t.id) },
  "recently-added": { label: "Recently Added", trackIds: ["9", "10", "8", "7", "6"] },
  favorites: { label: "Favorites", trackIds: ["1", "3", "5", "7", "9"] },
  "recently-played": { label: "Recently Played", trackIds: ["2", "4", "6", "1", "10"] },
};

export default function MusicApp({ window: win }: Props) {
  const [currentTrack, setCurrentTrack] = useState<Track>(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [activePlaylist, setActivePlaylist] = useState<PlaylistKey>("library");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const visibleTracks = PLAYLISTS[activePlaylist].trackIds
    .map((id) => TRACKS.find((t) => t.id === id))
    .filter((t): t is Track => t !== undefined);

  // Progress bar animation
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Auto-advance to next track
            const idx = visibleTracks.findIndex((t) => t.id === currentTrack.id);
            const next = visibleTracks[(idx + 1) % visibleTracks.length];
            setCurrentTrack(next);
            return 0;
          }
          return prev + 100 / currentTrack.durationSec;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentTrack, visibleTracks]);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const prevTrack = useCallback(() => {
    const idx = visibleTracks.findIndex((t) => t.id === currentTrack.id);
    const prev = visibleTracks[(idx - 1 + visibleTracks.length) % visibleTracks.length];
    setCurrentTrack(prev);
    setProgress(0);
  }, [visibleTracks, currentTrack]);

  const nextTrack = useCallback(() => {
    const idx = visibleTracks.findIndex((t) => t.id === currentTrack.id);
    const next = visibleTracks[(idx + 1) % visibleTracks.length];
    setCurrentTrack(next);
    setProgress(0);
  }, [visibleTracks, currentTrack]);

  const elapsed = Math.floor((progress / 100) * currentTrack.durationSec);
  const elapsedMin = Math.floor(elapsed / 60);
  const elapsedSec = elapsed % 60;

  return (
    <div className="flex flex-col h-full bg-[#1c1c1e] text-white select-none">
      {/* Main area: sidebar + content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <div className="w-52 shrink-0 bg-[#2c2c2e]/80 border-r border-white/10 flex flex-col py-3 px-2 gap-1 overflow-y-auto">
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-2 mb-1">
            Apple Music
          </span>
          <SidebarItem
            icon="🎵"
            label="Library"
            active={activePlaylist === "library"}
            onClick={() => setActivePlaylist("library")}
          />
          <SidebarItem
            icon="🕐"
            label="Recently Added"
            active={activePlaylist === "recently-added"}
            onClick={() => setActivePlaylist("recently-added")}
          />

          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-2 mt-4 mb-1">
            Playlists
          </span>
          <SidebarItem
            icon="❤️"
            label="Favorites"
            active={activePlaylist === "favorites"}
            onClick={() => setActivePlaylist("favorites")}
          />
          <SidebarItem
            icon="🔁"
            label="Recently Played"
            active={activePlaylist === "recently-played"}
            onClick={() => setActivePlaylist("recently-played")}
          />
        </div>

        {/* Track list */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="px-5 pt-4 pb-2">
            <h2 className="text-xl font-bold">{PLAYLISTS[activePlaylist].label}</h2>
            <p className="text-xs text-white/40 mt-0.5">{visibleTracks.length} songs</p>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-white/30 uppercase tracking-wider border-b border-white/10">
                  <th className="text-left font-medium py-2 pl-3 w-8">#</th>
                  <th className="text-left font-medium py-2">Title</th>
                  <th className="text-left font-medium py-2">Artist</th>
                  <th className="text-left font-medium py-2">Album</th>
                  <th className="text-right font-medium py-2 pr-3">Duration</th>
                </tr>
              </thead>
              <tbody>
                {visibleTracks.map((track, i) => {
                  const isActive = track.id === currentTrack.id;
                  return (
                    <tr
                      key={track.id}
                      className={`group cursor-pointer rounded-lg transition-colors ${
                        isActive
                          ? "bg-white/10"
                          : "hover:bg-white/5"
                      }`}
                      onDoubleClick={() => playTrack(track)}
                    >
                      <td className="py-2 pl-3 rounded-l-lg">
                        {isActive && isPlaying ? (
                          <span className="text-[#fc3c44] text-xs">♫</span>
                        ) : (
                          <span className="text-white/30 group-hover:text-white/60 text-xs">
                            {i + 1}
                          </span>
                        )}
                      </td>
                      <td className="py-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-[4px] shrink-0 bg-gradient-to-br ${track.gradient}`}
                          />
                          <span className={isActive ? "text-[#fc3c44] font-medium" : ""}>
                            {track.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 text-white/60">{track.artist}</td>
                      <td className="py-2 text-white/60">{track.album}</td>
                      <td className="py-2 pr-3 text-right text-white/40 rounded-r-lg">
                        {track.duration}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Now Playing bar */}
      <div className="shrink-0 h-20 bg-[#2c2c2e] border-t border-white/10 flex items-center px-4 gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 w-52 shrink-0">
          <div
            className={`w-12 h-12 rounded-lg shrink-0 bg-gradient-to-br ${currentTrack.gradient} shadow-lg`}
          />
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{currentTrack.title}</div>
            <div className="text-xs text-white/50 truncate">{currentTrack.artist}</div>
          </div>
        </div>

        {/* Controls + progress */}
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-white/60 hover:text-white transition-colors"
              onClick={prevTrack}
              aria-label="Previous track"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2h2v5.5L13 2v12L4 8.5V14H2V2z" />
              </svg>
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="#1c1c1e">
                  <rect x="3" y="2" width="3" height="10" rx="0.5" />
                  <rect x="8" y="2" width="3" height="10" rx="0.5" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="#1c1c1e">
                  <path d="M4 2.5v9l7.5-4.5L4 2.5z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              className="text-white/60 hover:text-white transition-colors"
              onClick={nextTrack}
              aria-label="Next track"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M14 2h-2v5.5L3 2v12l9-5.5V14h2V2z" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-[10px] text-white/40 w-8 text-right tabular-nums">
              {elapsedMin}:{String(elapsedSec).padStart(2, "0")}
            </span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
              <div
                className="h-full bg-white/60 rounded-full transition-[width] duration-1000 ease-linear group-hover:bg-[#fc3c44]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-white/40 w-8 tabular-nums">
              {currentTrack.duration}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-32 shrink-0 justify-end">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white/40 shrink-0"
          >
            <path d="M2 5.5h2.5L8 2v12l-3.5-3.5H2v-5z" fill="currentColor" stroke="none" />
            {volume > 0 && <path d="M10 5.5c.8.8.8 3.2 0 4" strokeLinecap="round" />}
            {volume > 40 && <path d="M11.5 3.5c1.6 1.6 1.6 6.4 0 8" strokeLinecap="round" />}
          </svg>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full h-1 appearance-none bg-white/10 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left w-full transition-colors ${
        active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/80"
      }`}
      onClick={onClick}
    >
      <span className="text-sm">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
