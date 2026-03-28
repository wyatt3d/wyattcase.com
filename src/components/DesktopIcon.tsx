"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useDesktopStore } from "@/lib/store";
import type { DesktopItem } from "@/lib/types";

interface Props {
  item: DesktopItem;
  onDoubleClick: (item: DesktopItem) => void;
}

export default function DesktopIcon({ item, onDoubleClick }: Props) {
  const { updateItem, deleteItem, showContextMenu, editingItemId, setEditingItemId, selectedItemId, setSelectedItemId } =
    useDesktopStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; itemX: number; itemY: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = editingItemId === item.id;
  const isSelected = selectedItemId === item.id;
  const [editName, setEditName] = useState(item.name);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing) return;
      e.preventDefault();
      e.stopPropagation();
      setSelectedItemId(item.id);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        itemX: item.x,
        itemY: item.y,
      };
      setIsDragging(true);
    },
    [isEditing, item.id, item.x, item.y, setSelectedItemId]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        updateItem(item.id, {
          x: Math.max(0, dragRef.current.itemX + dx),
          y: Math.max(25, dragRef.current.itemY + dy),
        });
      }
    };

    const handleMouseUp = () => {
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

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedItemId(item.id);
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
                x: item.x + 20,
                y: item.y + 20,
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
    [item, showContextMenu, deleteItem, setEditingItemId, setSelectedItemId, onDoubleClick]
  );

  const commitRename = useCallback(() => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== item.name) {
      updateItem(item.id, { name: trimmed });
    }
    setEditingItemId(null);
  }, [editName, item.id, item.name, updateItem, setEditingItemId]);

  const icon = item.type === "folder" ? "📁" : item.name.endsWith(".txt") ? "📄" : "📄";

  return (
    <div
      className={`absolute flex flex-col items-center gap-0.5 w-[80px] cursor-default select-none group ${isDragging ? "opacity-70" : ""}`}
      style={{ left: item.x, top: item.y }}
      onMouseDown={handleMouseDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!isEditing) onDoubleClick(item);
      }}
      onContextMenu={handleContextMenu}
    >
      <div
        className={`text-[48px] leading-none drop-shadow-lg transition-transform ${isSelected ? "scale-105" : ""}`}
      >
        {icon}
      </div>
      {isEditing ? (
        <input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setEditingItemId(null);
          }}
          className="w-[90px] text-center text-[11px] bg-white text-black rounded px-1 py-0.5 outline-none border-2 border-[#3478f6]"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className={`text-[11px] text-white text-center leading-tight px-1 py-0.5 rounded max-w-[90px] truncate drop-shadow-md ${
            isSelected ? "bg-[#3478f6]" : ""
          }`}
        >
          {item.name}
        </span>
      )}
    </div>
  );
}
