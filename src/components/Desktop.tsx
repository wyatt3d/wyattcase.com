"use client";

import { useEffect, useCallback } from "react";
import { useDesktopStore } from "@/lib/store";
import type { DesktopItem } from "@/lib/types";
import MenuBar from "./MenuBar";
import Dock from "./Dock";
import ContextMenu from "./ContextMenu";
import DesktopIcon from "./DesktopIcon";
import Window from "./Window";
import FinderApp from "./apps/FinderApp";
import TextEditApp from "./apps/TextEditApp";
import TerminalApp from "./apps/TerminalApp";

export default function Desktop() {
  const {
    items,
    windows,
    hydrated,
    hydrate,
    addItem,
    showContextMenu,
    hideContextMenu,
    openWindow,
    setSelectedItemId,
    setEditingItemId,
  } = useDesktopStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const desktopItems = items.filter((i) => i.parentId === null);

  const handleDesktopContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      hideContextMenu();
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
                x: e.clientX - 40,
                y: e.clientY - 30,
                parentId: null,
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
                x: e.clientX - 40,
                y: e.clientY - 30,
                parentId: null,
                content: "",
              });
              setTimeout(() => setEditingItemId(newItem.id), 50);
            },
          },
          { label: "", action: () => {}, separator: true },
          {
            label: "Change Wallpaper",
            action: () => {
              const colors = [
                "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
                "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
                "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0d1b2a 100%)",
                "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
              ];
              const current = document.getElementById("desktop-bg")?.style.background || "";
              const idx = colors.indexOf(current);
              const next = colors[(idx + 1) % colors.length];
              const el = document.getElementById("desktop-bg");
              if (el) el.style.background = next;
              try {
                localStorage.setItem("wyattcase-wallpaper", next);
              } catch {}
            },
          },
          { label: "", action: () => {}, separator: true },
          {
            label: "Sort by Name",
            action: () => {
              const sorted = [...desktopItems].sort((a, b) =>
                a.name.localeCompare(b.name)
              );
              const { updateItem } = useDesktopStore.getState();
              sorted.forEach((item, i) => {
                updateItem(item.id, {
                  x: 80,
                  y: 60 + i * 110,
                });
              });
            },
          },
        ],
      });
    },
    [addItem, showContextMenu, hideContextMenu, desktopItems, setEditingItemId]
  );

  const handleDesktopClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        setSelectedItemId(null);
        hideContextMenu();
      }
    },
    [setSelectedItemId, hideContextMenu]
  );

  const handleItemOpen = useCallback(
    (item: DesktopItem) => {
      if (item.type === "folder") {
        const centerX = Math.max(100, (window.innerWidth - 800) / 2);
        const centerY = Math.max(50, (window.innerHeight - 500) / 2);
        openWindow({
          appId: "finder",
          title: item.name,
          x: centerX,
          y: centerY,
          width: 800,
          height: 500,
          minimized: false,
          maximized: false,
          data: { folderId: item.id },
        });
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
    [openWindow]
  );

  // Load wallpaper
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wyattcase-wallpaper");
      if (saved) {
        const el = document.getElementById("desktop-bg");
        if (el) el.style.background = saved;
      }
    } catch {}
  }, [hydrated]);

  if (!hydrated) {
    return (
      <div className="h-screen w-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="text-white/50 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden select-none">
      {/* Wallpaper */}
      <div
        id="desktop-bg"
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      />

      <MenuBar />

      {/* Desktop area */}
      <div
        className="absolute inset-0 pt-[25px] pb-[70px]"
        onClick={handleDesktopClick}
        onContextMenu={handleDesktopContextMenu}
      >
        {desktopItems.map((item) => (
          <DesktopIcon
            key={item.id}
            item={item}
            onDoubleClick={handleItemOpen}
          />
        ))}
      </div>

      {/* Windows */}
      {windows.map((win) => (
        <Window key={win.id} window={win}>
          {win.appId === "finder" && <FinderApp window={win} />}
          {win.appId === "textedit" && <TextEditApp window={win} />}
          {win.appId === "terminal" && <TerminalApp window={win} />}
          {win.appId === "safari" && (
            <div className="h-full bg-white flex items-center justify-center text-gray-400 text-sm">
              Safari — Coming soon
            </div>
          )}
          {win.appId === "notes" && <TextEditApp window={win} />}
          {win.appId === "settings" && (
            <div className="h-full bg-[#1e1e1e] flex items-center justify-center text-white/40 text-sm">
              System Settings — Coming soon
            </div>
          )}
        </Window>
      ))}

      <Dock />
      <ContextMenu />
    </div>
  );
}
