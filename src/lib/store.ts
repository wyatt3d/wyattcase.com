"use client";

import { create } from "zustand";
import type { DesktopItem, WindowState } from "./types";

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const DEFAULT_ITEMS: DesktopItem[] = [
  {
    id: "folder-documents",
    name: "Documents",
    type: "folder",
    x: 80,
    y: 60,
    parentId: null,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: "folder-projects",
    name: "Projects",
    type: "folder",
    x: 80,
    y: 170,
    parentId: null,
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
  {
    id: "file-readme",
    name: "README.txt",
    type: "file",
    x: 80,
    y: 280,
    parentId: null,
    content: "Welcome to wyattcase.com\n\nThis is a macOS-style desktop running in your browser.\nRight-click to create files and folders.\nDouble-click to open them.\n\nAll changes are saved automatically.",
    createdAt: Date.now(),
    modifiedAt: Date.now(),
  },
];

interface DesktopStore {
  // Items
  items: DesktopItem[];
  setItems: (items: DesktopItem[]) => void;
  addItem: (item: Omit<DesktopItem, "id" | "createdAt" | "modifiedAt">) => DesktopItem;
  updateItem: (id: string, updates: Partial<DesktopItem>) => void;
  deleteItem: (id: string) => void;
  getChildren: (parentId: string | null) => DesktopItem[];

  // Windows
  windows: WindowState[];
  topZIndex: number;
  openWindow: (win: Omit<WindowState, "id" | "zIndex">) => string;
  closeWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<WindowState>) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;

  // Context menu
  contextMenu: { x: number; y: number; items: { label: string; action: () => void; separator?: boolean; disabled?: boolean }[] } | null;
  showContextMenu: (menu: NonNullable<DesktopStore["contextMenu"]>) => void;
  hideContextMenu: () => void;

  // Editing
  editingItemId: string | null;
  setEditingItemId: (id: string | null) => void;

  // Selection
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string>) => void;
  toggleSelectedId: (id: string) => void;
  clearSelection: () => void;

  // Persistence
  hydrated: boolean;
  hydrate: () => void;
  persist: () => void;
}

const STORAGE_KEY = "wyattcase-desktop";

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  items: [],
  hydrated: false,

  hydrate: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        set({ items: data.items || DEFAULT_ITEMS, hydrated: true });
      } else {
        set({ items: DEFAULT_ITEMS, hydrated: true });
      }
    } catch {
      set({ items: DEFAULT_ITEMS, hydrated: true });
    }
  },

  persist: () => {
    try {
      const { items } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
    } catch {
      // localStorage might be full
    }
  },

  setItems: (items) => {
    set({ items });
    get().persist();
  },

  addItem: (partial) => {
    const item: DesktopItem = {
      ...partial,
      id: generateId(),
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
    set((s) => ({ items: [...s.items, item] }));
    get().persist();
    return item;
  },

  updateItem: (id, updates) => {
    set((s) => ({
      items: s.items.map((item) =>
        item.id === id ? { ...item, ...updates, modifiedAt: Date.now() } : item
      ),
    }));
    get().persist();
  },

  deleteItem: (id) => {
    // Recursively delete children
    const deleteIds = new Set<string>();
    const collect = (targetId: string) => {
      deleteIds.add(targetId);
      get()
        .items.filter((i) => i.parentId === targetId)
        .forEach((child) => collect(child.id));
    };
    collect(id);
    set((s) => ({ items: s.items.filter((i) => !deleteIds.has(i.id)) }));
    get().persist();
  },

  getChildren: (parentId) => {
    return get().items.filter((i) => i.parentId === parentId);
  },

  // Windows
  windows: [],
  topZIndex: 100,

  openWindow: (win) => {
    const id = generateId();
    const zIndex = get().topZIndex + 1;
    set((s) => ({
      windows: [...s.windows, { ...win, id, zIndex }],
      topZIndex: zIndex,
    }));
    return id;
  },

  closeWindow: (id) => {
    set((s) => ({ windows: s.windows.filter((w) => w.id !== id) }));
  },

  updateWindow: (id, updates) => {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));
  },

  focusWindow: (id) => {
    const zIndex = get().topZIndex + 1;
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, zIndex, minimized: false } : w)),
      topZIndex: zIndex,
    }));
  },

  minimizeWindow: (id) => {
    set((s) => ({
      windows: s.windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
    }));
  },

  toggleMaximize: (id) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === id ? { ...w, maximized: !w.maximized } : w
      ),
    }));
  },

  // Context menu
  contextMenu: null,
  showContextMenu: (menu) => set({ contextMenu: menu }),
  hideContextMenu: () => set({ contextMenu: null }),

  // Editing
  editingItemId: null,
  setEditingItemId: (id) => set({ editingItemId: id }),

  // Selection
  selectedItemId: null,
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  selectedIds: new Set<string>(),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  toggleSelectedId: (id) => {
    const current = new Set(get().selectedIds);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    set({ selectedIds: current, selectedItemId: current.size > 0 ? id : null });
  },
  clearSelection: () => set({ selectedIds: new Set<string>(), selectedItemId: null }),
}));
