"use client";

import { useState, useCallback, useMemo } from "react";
import type { WindowState } from "@/lib/types";

interface Props {
  window: WindowState;
}

interface PhotoItem {
  id: string;
  label: string;
  gradient: string;
  favorited: boolean;
  album: string | null;
  createdAt: number;
}

type SidebarSection = "library" | "recents" | "favorites" | "album";
type GridSize = "small" | "medium" | "large";

const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  "linear-gradient(135deg, #f5576c 0%, #ff9068 100%)",
  "linear-gradient(135deg, #13547a 0%, #80d0c7 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
  "linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)",
  "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
  "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)",
  "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #ff8177 0%, #cf556c 100%)",
];

const LABELS = [
  "Sunset Beach", "Mountain View", "City Lights", "Garden Path",
  "Ocean Wave", "Autumn Leaves", "Starry Night", "Morning Dew",
  "Golden Hour", "Coral Reef", "Cherry Blossom", "Lavender Field",
  "Rose Petals", "Clear Sky", "Spring Meadow", "Tropical Breeze",
  "Misty Forest", "Warm Glow", "Peach Sunset", "Crimson Dawn",
];

const ALBUMS = ["Vacation", "Nature", "Portraits"];

function createInitialPhotos(): PhotoItem[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: `photo-${i}`,
    label: LABELS[i % LABELS.length],
    gradient: GRADIENTS[i % GRADIENTS.length],
    favorited: i < 4,
    album: i < 6 ? ALBUMS[i % ALBUMS.length] : i < 10 ? ALBUMS[(i + 1) % ALBUMS.length] : null,
    createdAt: Date.now() - (20 - i) * 86400000,
  }));
}

const GRID_SIZES: Record<GridSize, string> = {
  small: "grid-cols-[repeat(auto-fill,minmax(80px,1fr))]",
  medium: "grid-cols-[repeat(auto-fill,minmax(140px,1fr))]",
  large: "grid-cols-[repeat(auto-fill,minmax(200px,1fr))]",
};

const ASPECT_RATIOS: Record<GridSize, string> = {
  small: "aspect-square",
  medium: "aspect-[4/3]",
  large: "aspect-[4/3]",
};

export default function PhotosApp({ window: win }: Props) {
  const [photos, setPhotos] = useState<PhotoItem[]>(createInitialPhotos);
  const [activeSection, setActiveSection] = useState<SidebarSection>("library");
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [gridSize, setGridSize] = useState<GridSize>("medium");

  const albums = useMemo(() => {
    const albumSet = new Set<string>();
    for (const p of photos) {
      if (p.album) albumSet.add(p.album);
    }
    return Array.from(albumSet).sort();
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    switch (activeSection) {
      case "recents":
        return [...photos].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
      case "favorites":
        return photos.filter((p) => p.favorited);
      case "album":
        return photos.filter((p) => p.album === activeAlbum);
      default:
        return photos;
    }
  }, [photos, activeSection, activeAlbum]);

  const handleImport = useCallback(() => {
    const idx = photos.length;
    const newPhoto: PhotoItem = {
      id: `photo-${Date.now()}`,
      label: LABELS[idx % LABELS.length],
      gradient: GRADIENTS[idx % GRADIENTS.length],
      favorited: false,
      album: null,
      createdAt: Date.now(),
    };
    setPhotos((prev) => [...prev, newPhoto]);
  }, [photos.length]);

  const toggleFavorite = useCallback((id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, favorited: !p.favorited } : p))
    );
  }, []);

  const openLightbox = useCallback(
    (photo: PhotoItem) => {
      const idx = filteredPhotos.findIndex((p) => p.id === photo.id);
      setLightboxIndex(idx >= 0 ? idx : null);
    },
    [filteredPhotos]
  );

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const navigateLightbox = useCallback(
    (dir: -1 | 1) => {
      setLightboxIndex((prev) => {
        if (prev === null) return null;
        const next = prev + dir;
        if (next < 0 || next >= filteredPhotos.length) return prev;
        return next;
      });
    },
    [filteredPhotos.length]
  );

  const sectionTitle = activeSection === "album" ? activeAlbum ?? "Album" :
    activeSection === "library" ? "Library" :
    activeSection === "recents" ? "Recents" : "Favorites";

  return (
    <div className="flex h-full text-white text-[13px] select-none">
      {/* Sidebar */}
      <div className="w-[180px] bg-[rgba(30,30,30,0.6)] border-r border-white/10 py-2 shrink-0 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
          Photos
        </div>
        {(
          [
            { key: "library", label: "Library", icon: "🖼️" },
            { key: "recents", label: "Recents", icon: "🕐" },
            { key: "favorites", label: "Favorites", icon: "❤️" },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActiveSection(item.key);
              setActiveAlbum(null);
              setLightboxIndex(null);
            }}
            className={`w-[calc(100%-8px)] text-left px-3 py-1 flex items-center gap-2 hover:bg-white/10 rounded-md mx-1 transition-colors ${
              activeSection === item.key && activeAlbum === null ? "bg-white/15" : ""
            }`}
          >
            <span className="text-[14px]">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}

        <div className="px-3 pt-4 pb-1 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
          Albums
        </div>
        {albums.map((album) => (
          <button
            key={album}
            onClick={() => {
              setActiveSection("album");
              setActiveAlbum(album);
              setLightboxIndex(null);
            }}
            className={`w-[calc(100%-8px)] text-left px-3 py-1 flex items-center gap-2 hover:bg-white/10 rounded-md mx-1 transition-colors ${
              activeSection === "album" && activeAlbum === album ? "bg-white/15" : ""
            }`}
          >
            <span className="text-[14px]">📁</span>
            <span className="truncate">{album}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-[38px] bg-[#2a2a2a] border-b border-white/5 flex items-center px-3 gap-3 shrink-0">
          <span className="text-white/80 font-medium text-[13px]">{sectionTitle}</span>
          <span className="text-white/30 text-[11px]">
            {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? "s" : ""}
          </span>
          <div className="flex-1" />

          {/* Grid size controls */}
          <div className="flex items-center gap-1 bg-white/5 rounded-md p-0.5">
            {(["small", "medium", "large"] as const).map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  gridSize === size ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80"
                }`}
                title={`${size.charAt(0).toUpperCase() + size.slice(1)} grid`}
              >
                {size === "small" ? "⊞" : size === "medium" ? "⊟" : "☐"}
              </button>
            ))}
          </div>

          {/* Import button */}
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0a84ff] hover:bg-[#409cff] text-white text-[12px] font-medium transition-colors"
          >
            <span className="text-[14px] leading-none">+</span>
            Import
          </button>
        </div>

        {/* Photo grid */}
        <div className="flex-1 overflow-y-auto p-3 relative">
          {filteredPhotos.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/30">
              {activeSection === "favorites"
                ? "No favorites yet"
                : activeSection === "album"
                ? "This album is empty"
                : "No photos"}
            </div>
          ) : (
            <div className={`grid ${GRID_SIZES[gridSize]} gap-2`}>
              {filteredPhotos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => openLightbox(photo)}
                  className="group relative rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#0a84ff] transition-all focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
                >
                  <div
                    className={`w-full ${ASPECT_RATIOS[gridSize]}`}
                    style={{ background: photo.gradient }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4">
                    <span className="text-[11px] text-white/90 leading-tight block truncate">
                      {photo.label}
                    </span>
                  </div>
                  {photo.favorited && (
                    <span className="absolute top-1.5 right-1.5 text-[12px] drop-shadow">❤️</span>
                  )}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Lightbox overlay */}
          {lightboxIndex !== null && filteredPhotos[lightboxIndex] != null && (
            <div
              className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center"
              onClick={closeLightbox}
            >
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-[18px] transition-colors z-10"
                aria-label="Close lightbox"
              >
                ✕
              </button>

              {/* Favorite toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(filteredPhotos[lightboxIndex].id);
                }}
                className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-[16px] transition-colors z-10"
                aria-label="Toggle favorite"
              >
                {filteredPhotos[lightboxIndex].favorited ? "❤️" : "🤍"}
              </button>

              {/* Main image */}
              <div
                className="w-[80%] max-w-[600px] aspect-[4/3] rounded-xl shadow-2xl"
                style={{ background: filteredPhotos[lightboxIndex].gradient }}
                onClick={(e) => e.stopPropagation()}
              />

              {/* Label */}
              <div className="mt-3 text-white/80 text-[14px] font-medium">
                {filteredPhotos[lightboxIndex].label}
              </div>
              <div className="text-white/40 text-[11px] mt-0.5">
                {lightboxIndex + 1} of {filteredPhotos.length}
              </div>

              {/* Left arrow */}
              {lightboxIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox(-1);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-[20px] transition-colors"
                  aria-label="Previous photo"
                >
                  ‹
                </button>
              )}

              {/* Right arrow */}
              {lightboxIndex < filteredPhotos.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateLightbox(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-[20px] transition-colors"
                  aria-label="Next photo"
                >
                  ›
                </button>
              )}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="h-[24px] bg-[#1e1e1e] border-t border-white/5 flex items-center px-3 text-[11px] text-white/40 shrink-0">
          {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? "s" : ""}
          {activeSection === "library" && ` · ${albums.length} album${albums.length !== 1 ? "s" : ""}`}
        </div>
      </div>
    </div>
  );
}
