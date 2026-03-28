"use client";

import { useCallback } from "react";
import { useDesktopStore } from "@/lib/store";
import type { WindowState, DesktopItem } from "@/lib/types";

interface Props {
  window: WindowState;
}

export default function FinderApp({ window: win }: Props) {
  const { items, updateWindow, openWindow, addItem, deleteItem, showContextMenu, setEditingItemId } =
    useDesktopStore();

  const folderId = (win.data?.folderId as string) ?? null;
  const children = items.filter((i) => i.parentId === folderId);
  const currentFolder = folderId ? items.find((i) => i.id === folderId) : null;

  // Sidebar folders
  const sidebarItems = [
    { label: "Desktop", icon: "🖥️", folderId: null },
    ...items
      .filter((i) => i.type === "folder" && i.parentId === null)
      .map((f) => ({ label: f.name, icon: "📁", folderId: f.id })),
  ];

  const navigateTo = useCallback(
    (targetFolderId: string | null) => {
      const folder = targetFolderId ? items.find((i) => i.id === targetFolderId) : null;
      updateWindow(win.id, {
        data: { folderId: targetFolderId },
        title: folder ? folder.name : "Finder",
      });
    },
    [items, updateWindow, win.id]
  );

  const openItem = useCallback(
    (item: DesktopItem) => {
      if (item.type === "folder") {
        navigateTo(item.id);
      } else if (item.type === "file") {
        const centerX = Math.max(100, (window.innerWidth - 600) / 2) + Math.random() * 60;
        const centerY = Math.max(50, (window.innerHeight - 400) / 2) + Math.random() * 40;
        openWindow({
          appId: "textedit",
          title: item.name,
          x: centerX,
          y: centerY,
          width: 600,
          height: 400,
          minimized: false,
          maximized: false,
          data: { content: item.content || "", fileId: item.id },
        });
      }
    },
    [navigateTo, openWindow]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      showContextMenu({
        x: e.clientX,
        y: e.clientY,
        items: [
          {
            label: "New Folder",
            action: () => {
              const newItem = addItem({
                name: "untitled folder",
                type: "folder",
                x: 80,
                y: 80,
                parentId: folderId,
              });
              setTimeout(() => setEditingItemId(newItem.id), 50);
            },
          },
          {
            label: "New File",
            action: () => {
              const newItem = addItem({
                name: "untitled.txt",
                type: "file",
                x: 80,
                y: 80,
                parentId: folderId,
                content: "",
              });
              setTimeout(() => setEditingItemId(newItem.id), 50);
            },
          },
          { label: "", action: () => {}, separator: true },
          {
            label: "Get Info",
            action: () => {
              alert(
                `Folder: ${currentFolder?.name || "Desktop"}\nItems: ${children.length}`
              );
            },
          },
        ],
      });
    },
    [showContextMenu, addItem, folderId, currentFolder, children.length, setEditingItemId]
  );

  return (
    <div className="flex h-full text-white text-[13px]">
      {/* Sidebar */}
      <div className="w-[170px] bg-[rgba(30,30,30,0.6)] border-r border-white/10 py-2 shrink-0 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
          Favorites
        </div>
        {sidebarItems.map((item) => (
          <button
            key={item.folderId ?? "desktop"}
            onClick={() => navigateTo(item.folderId)}
            className={`w-full text-left px-3 py-1 flex items-center gap-2 hover:bg-white/10 rounded-md mx-1 transition-colors ${
              folderId === item.folderId ? "bg-white/10" : ""
            }`}
            style={{ width: "calc(100% - 8px)" }}
          >
            <span>{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-[36px] bg-[#2a2a2a] border-b border-white/5 flex items-center px-3 gap-2 shrink-0">
          <button
            onClick={() => {
              if (currentFolder?.parentId !== undefined) {
                navigateTo(currentFolder?.parentId ?? null);
              }
            }}
            disabled={!folderId}
            className="text-white/60 hover:text-white disabled:opacity-30 text-[16px]"
          >
            ←
          </button>
          <button disabled className="text-white/60 opacity-30 text-[16px]">
            →
          </button>
          <span className="ml-2 text-white/60">{currentFolder?.name || "Desktop"}</span>
        </div>

        {/* File grid */}
        <div
          className="flex-1 p-4 overflow-y-auto"
          onContextMenu={handleContextMenu}
        >
          {children.length === 0 ? (
            <div className="flex items-center justify-center h-full text-white/30">
              This folder is empty
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,90px)] gap-2">
              {children.map((item) => (
                <FinderItem
                  key={item.id}
                  item={item}
                  onOpen={openItem}
                  onDelete={deleteItem}
                  showContextMenu={showContextMenu}
                  setEditingItemId={setEditingItemId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="h-[24px] bg-[#1e1e1e] border-t border-white/5 flex items-center px-3 text-[11px] text-white/40 shrink-0">
          {children.length} item{children.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

function FinderItem({
  item,
  onOpen,
  onDelete,
  showContextMenu,
  setEditingItemId,
}: {
  item: DesktopItem;
  onOpen: (item: DesktopItem) => void;
  onDelete: (id: string) => void;
  showContextMenu: (menu: { x: number; y: number; items: { label: string; action: () => void; separator?: boolean }[] }) => void;
  setEditingItemId: (id: string | null) => void;
}) {
  const { editingItemId, updateItem } = useDesktopStore();
  const isEditing = editingItemId === item.id;
  const icon = item.type === "folder" ? "📁" : "📄";

  return (
    <div
      className="flex flex-col items-center gap-0.5 p-2 rounded-lg hover:bg-white/10 cursor-default select-none"
      onDoubleClick={() => onOpen(item)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu({
          x: e.clientX,
          y: e.clientY,
          items: [
            { label: "Open", action: () => onOpen(item) },
            {
              label: "Rename",
              action: () => setEditingItemId(item.id),
            },
            { label: "", action: () => {}, separator: true },
            { label: "Move to Trash", action: () => onDelete(item.id) },
          ],
        });
      }}
    >
      <span className="text-[36px] leading-none">{icon}</span>
      {isEditing ? (
        <input
          autoFocus
          defaultValue={item.name}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v) updateItem(item.id, { name: v });
            setEditingItemId(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setEditingItemId(null);
          }}
          className="w-[80px] text-center text-[11px] bg-white text-black rounded px-1 py-0.5 outline-none"
        />
      ) : (
        <span className="text-[11px] text-white text-center leading-tight max-w-[80px] truncate">
          {item.name}
        </span>
      )}
    </div>
  );
}
