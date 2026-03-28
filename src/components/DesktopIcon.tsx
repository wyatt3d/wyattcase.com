"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useDesktopStore } from "@/lib/store";
import type { DesktopItem } from "@/lib/types";

const GRID_SIZE = 80;

function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function getFileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

const FOLDER_COLORS: Record<string, string> = {
  Documents: "hue-rotate-[200deg] saturate-150",
  Projects: "hue-rotate-[270deg] saturate-150",
  Downloads: "grayscale-[40%]",
};

function getIcon(item: DesktopItem): string {
  if (item.icon) return item.icon;

  if (item.type === "folder") return "📁";

  const ext = getFileExtension(item.name);
  switch (ext) {
    case ".txt":
      return "📄";
    case ".md":
      return "📝";
    case ".json":
      return "📋";
    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".gif":
    case ".svg":
    case ".webp":
      return "🖼️";
    case ".mp3":
    case ".wav":
    case ".ogg":
    case ".flac":
    case ".aac":
      return "🎵";
    case ".pdf":
      return "📕";
    default:
      return "📄";
  }
}

interface Props {
  item: DesktopItem;
  onDoubleClick: (item: DesktopItem) => void;
}

export default function DesktopIcon({ item, onDoubleClick }: Props) {
  const {
    updateItem,
    deleteItem,
    showContextMenu,
    editingItemId,
    setEditingItemId,
    selectedIds,
    setSelectedIds,
    toggleSelectedId,
    clearSelection,
    setSelectedItemId,
  } = useDesktopStore();

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    itemX: number;
    itemY: number;
    hasMoved: boolean;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastClickTimeRef = useRef<number>(0);
  const slowDoubleClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEditing = editingItemId === item.id;
  const isSelected = selectedIds.has(item.id);
  const [editName, setEditName] = useState(item.name);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select filename without extension
      const dotIndex = editName.lastIndexOf(".");
      if (dotIndex > 0 && item.type === "file") {
        inputRef.current.setSelectionRange(0, dotIndex);
      } else {
        inputRef.current.select();
      }
    }
  }, [isEditing, editName, item.type]);

  // Keyboard handler when selected
  useEffect(() => {
    if (!isSelected || isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteItem(item.id);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        setEditName(item.name);
        setEditingItemId(item.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelected, isEditing, item.id, item.name, deleteItem, setEditingItemId]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing) return;
      e.preventDefault();
      e.stopPropagation();

      // Handle selection
      if (e.metaKey || e.ctrlKey) {
        // Cmd+click toggles in multi-select
        toggleSelectedId(item.id);
      } else if (!isSelected) {
        // Regular click on unselected: select only this
        setSelectedIds(new Set([item.id]));
        setSelectedItemId(item.id);
      }
      // If already selected without modifier, keep selection (allows dragging multiple)

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        itemX: item.x,
        itemY: item.y,
        hasMoved: false,
      };
      setIsDragging(true);
    },
    [isEditing, isSelected, item.id, item.x, item.y, toggleSelectedId, setSelectedIds, setSelectedItemId]
  );

  // Drag logic
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;

      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      // Only start visual drag after small threshold
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.hasMoved = true;
      }

      if (dragRef.current.hasMoved) {
        updateItem(item.id, {
          x: Math.max(0, dragRef.current.itemX + dx),
          y: Math.max(25, dragRef.current.itemY + dy),
        });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (dragRef.current?.hasMoved) {
        // Snap to grid on drop
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const rawX = Math.max(0, dragRef.current.itemX + dx);
        const rawY = Math.max(25, dragRef.current.itemY + dy);
        updateItem(item.id, {
          x: snapToGrid(rawX),
          y: Math.max(25, snapToGrid(rawY)),
        });
      }
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, item.id, updateItem]);

  // Slow double-click rename detection
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing) return;
      e.stopPropagation();

      const now = Date.now();
      const timeSinceLastClick = now - lastClickTimeRef.current;

      // Clear any pending slow-double-click timer
      if (slowDoubleClickTimerRef.current) {
        clearTimeout(slowDoubleClickTimerRef.current);
        slowDoubleClickTimerRef.current = null;
      }

      if (isSelected && timeSinceLastClick > 500 && timeSinceLastClick < 2000) {
        // Slow double-click: trigger rename after a brief delay
        // (to distinguish from fast double-click which opens)
        slowDoubleClickTimerRef.current = setTimeout(() => {
          setEditName(item.name);
          setEditingItemId(item.id);
        }, 200);
      }

      lastClickTimeRef.current = now;
    },
    [isEditing, isSelected, item.id, item.name, setEditingItemId]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // Cancel slow-double-click rename on fast double-click
      if (slowDoubleClickTimerRef.current) {
        clearTimeout(slowDoubleClickTimerRef.current);
        slowDoubleClickTimerRef.current = null;
      }
      if (!isEditing) {
        onDoubleClick(item);
      }
    },
    [isEditing, item, onDoubleClick]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isSelected) {
        setSelectedIds(new Set([item.id]));
        setSelectedItemId(item.id);
      }

      showContextMenu({
        x: e.clientX,
        y: e.clientY,
        items: [
          { label: "Open", action: () => onDoubleClick(item) },
          {
            label: "Get Info",
            action: () => {
              alert(
                `Name: ${item.name}\nType: ${item.type}\nCreated: ${new Date(item.createdAt).toLocaleString()}\nModified: ${new Date(item.modifiedAt).toLocaleString()}`
              );
            },
          },
          { label: "", action: () => {}, separator: true },
          {
            label: "Rename",
            action: () => {
              setEditName(item.name);
              setEditingItemId(item.id);
            },
          },
          {
            label: "Duplicate",
            action: () => {
              const { addItem } = useDesktopStore.getState();
              addItem({
                name: item.name + " copy",
                type: item.type,
                x: item.x + GRID_SIZE,
                y: item.y,
                parentId: item.parentId,
                content: item.content,
              });
            },
          },
          { label: "", action: () => {}, separator: true },
          {
            label: "Move to Trash",
            action: () => deleteItem(item.id),
          },
        ],
      });
    },
    [item, isSelected, showContextMenu, deleteItem, setEditingItemId, setSelectedIds, setSelectedItemId, onDoubleClick]
  );

  const commitRename = useCallback(() => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== item.name) {
      updateItem(item.id, { name: trimmed });
    }
    setEditingItemId(null);
  }, [editName, item.id, item.name, updateItem, setEditingItemId]);

  const icon = getIcon(item);
  const folderColorClass =
    item.type === "folder" ? FOLDER_COLORS[item.name] ?? "" : "";

  return (
    <div
      ref={containerRef}
      className={`absolute flex flex-col items-center gap-0.5 w-[80px] cursor-default select-none group
        ${isDragging && dragRef.current?.hasMoved ? "opacity-60 z-50" : ""}
        transition-opacity duration-100`}
      style={{
        left: item.x,
        top: item.y,
        filter:
          isDragging && dragRef.current?.hasMoved
            ? "drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
            : undefined,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      {/* Icon */}
      <div
        className={`text-[48px] leading-none drop-shadow-lg transition-transform duration-100
          ${isSelected ? "scale-105" : ""}
          ${isDragging && dragRef.current?.hasMoved ? "scale-110" : ""}
          ${folderColorClass ? `filter ${folderColorClass}` : ""}`}
      >
        {icon}
      </div>

      {/* Name / Rename input */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitRename();
            }
            if (e.key === "Escape") {
              e.preventDefault();
              setEditingItemId(null);
            }
          }}
          className="w-[100px] text-center text-[11px] bg-white text-black rounded-[3px] px-1.5 py-[2px] outline-none border border-[#3478f6] shadow-[0_0_0_3px_rgba(52,120,246,0.3)]"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className={`text-[11px] text-white text-center leading-tight px-1.5 py-[1px] rounded-[3px] max-w-[90px] break-words line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]
            ${isSelected ? "bg-[#3478f6]" : ""}`}
        >
          {item.name}
        </span>
      )}
    </div>
  );
}
