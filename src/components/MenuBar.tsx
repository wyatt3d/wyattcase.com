"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDesktopStore } from "@/lib/store";

interface MenuBarProps {
  onOpenSettings?: () => void;
  onOpenAbout?: () => void;
  onToggleNotifications?: () => void;
}

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  separator?: boolean;
  disabled?: boolean;
}

interface MenuDefinition {
  label: string;
  bold?: boolean;
  items: MenuItem[];
}

export default function MenuBar({
  onOpenSettings,
  onOpenAbout,
  onToggleNotifications,
}: MenuBarProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const { windows, closeWindow, minimizeWindow, toggleMaximize, focusWindow, addItem, setEditingItemId } =
    useDesktopStore();

  // Clock: update every minute
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    };
    update();
    // Align to next minute boundary
    const msToNextMinute = (60 - new Date().getSeconds()) * 1000;
    const timeout = setTimeout(() => {
      update();
      const interval = setInterval(update, 60000);
      // Store cleanup ref
      return () => clearInterval(interval);
    }, msToNextMinute);
    // Also set a short interval for the first render cycle
    const shortInterval = setInterval(update, 60000);
    return () => {
      clearTimeout(timeout);
      clearInterval(shortInterval);
    };
  }, []);

  // Close menu on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMenu(null);
      }
    };
    if (activeMenu !== null) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [activeMenu]);

  // Close menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        menuBarRef.current &&
        !menuBarRef.current.contains(e.target as Node)
      ) {
        setActiveMenu(null);
      }
    };
    if (activeMenu !== null) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [activeMenu]);

  const handleMenuClick = useCallback(
    (index: number) => {
      setActiveMenu((prev) => (prev === index ? null : index));
    },
    []
  );

  const handleMenuHover = useCallback(
    (index: number) => {
      if (activeMenu !== null) {
        setActiveMenu(index);
      }
    },
    [activeMenu]
  );

  const handleItemClick = useCallback(
    (item: MenuItem) => {
      if (item.disabled || item.separator) return;
      item.action?.();
      setActiveMenu(null);
    },
    []
  );

  // Get the topmost (focused) window
  const focusedWindow =
    windows.length > 0
      ? windows.reduce((top, w) =>
          !w.minimized && w.zIndex > top.zIndex ? w : top
        )
      : null;

  const menus: MenuDefinition[] = [
    {
      label: "\uF8FF",
      bold: false,
      items: [
        {
          label: "About This Mac",
          action: () => onOpenAbout?.(),
        },
        { label: "", separator: true },
        {
          label: "System Settings...",
          action: () => onOpenSettings?.(),
        },
        { label: "", separator: true },
        { label: "Sleep", action: () => {} },
        { label: "Restart...", action: () => {} },
        {
          label: "Shut Down...",
          action: () => {},
        },
        { label: "", separator: true },
        {
          label: "Lock Screen",
          shortcut: "⌃⌘Q",
          action: () => {},
        },
      ],
    },
    {
      label: "File",
      items: [
        {
          label: "New Folder",
          shortcut: "⇧⌘N",
          action: () => {
            const newItem = addItem({
              name: "untitled folder",
              type: "folder",
              x: 80 + Math.random() * 100,
              y: 60 + Math.random() * 200,
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
              x: 80 + Math.random() * 100,
              y: 60 + Math.random() * 200,
              parentId: null,
              content: "",
            });
            setTimeout(() => setEditingItemId(newItem.id), 50);
          },
        },
        { label: "", separator: true },
        { label: "Open", shortcut: "⌘O", disabled: true },
        {
          label: "Close Window",
          shortcut: "⌘W",
          action: () => {
            if (focusedWindow) closeWindow(focusedWindow.id);
          },
          disabled: !focusedWindow,
        },
        { label: "", separator: true },
        {
          label: "Get Info",
          shortcut: "⌘I",
          disabled: true,
        },
      ],
    },
    {
      label: "Edit",
      items: [
        { label: "Undo", shortcut: "⌘Z", disabled: true },
        { label: "Redo", shortcut: "⇧⌘Z", disabled: true },
        { label: "", separator: true },
        { label: "Cut", shortcut: "⌘X", disabled: true },
        { label: "Copy", shortcut: "⌘C", disabled: true },
        { label: "Paste", shortcut: "⌘V", disabled: true },
        { label: "Select All", shortcut: "⌘A", disabled: true },
      ],
    },
    {
      label: "View",
      items: [
        { label: "as Icons", action: () => {} },
        { label: "as List", action: () => {} },
        { label: "as Columns", action: () => {} },
        { label: "", separator: true },
        { label: "Show Path Bar", action: () => {} },
      ],
    },
    {
      label: "Go",
      items: [
        { label: "Desktop", action: () => {} },
        { label: "Documents", action: () => {} },
        { label: "Home", shortcut: "⇧⌘H", action: () => {} },
        { label: "Applications", shortcut: "⇧⌘A", action: () => {} },
      ],
    },
    {
      label: "Window",
      items: [
        {
          label: "Minimize",
          shortcut: "⌘M",
          action: () => {
            if (focusedWindow) minimizeWindow(focusedWindow.id);
          },
          disabled: !focusedWindow,
        },
        {
          label: "Zoom",
          action: () => {
            if (focusedWindow) toggleMaximize(focusedWindow.id);
          },
          disabled: !focusedWindow,
        },
        ...(windows.length > 0
          ? [
              { label: "", separator: true } as MenuItem,
              ...windows.map(
                (w) =>
                  ({
                    label: w.title || w.appId,
                    action: () => focusWindow(w.id),
                  }) as MenuItem
              ),
            ]
          : []),
      ],
    },
    {
      label: "Help",
      items: [
        { label: "macOS Help", disabled: true },
      ],
    },
  ];

  return (
    <div
      ref={menuBarRef}
      className="fixed top-0 left-0 right-0 h-[25px] bg-[rgba(30,30,30,0.75)] backdrop-blur-2xl z-[9999] flex items-center px-2 text-[13px] text-white/90 font-[-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif] select-none border-b border-white/10"
    >
      {/* Left menus */}
      <div className="flex items-center h-full">
        {menus.map((menu, idx) => (
          <div key={menu.label} className="relative h-full flex items-center">
            <button
              className={`h-[22px] px-[10px] rounded-[3px] flex items-center transition-colors text-[13px] leading-none ${
                idx === 0
                  ? "text-[16px] px-[10px]"
                  : menu.bold !== false
                    ? ""
                    : ""
              } ${
                activeMenu === idx
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              } ${idx === 1 ? "font-semibold" : "font-normal"}`}
              onClick={() => handleMenuClick(idx)}
              onMouseEnter={() => handleMenuHover(idx)}
            >
              {menu.label}
            </button>

            {/* Dropdown */}
            {activeMenu === idx && (
              <div
                className="absolute top-[25px] left-0 min-w-[220px] py-[4px] rounded-[6px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/15"
                style={{
                  background: "rgba(30, 30, 30, 0.85)",
                  backdropFilter: "blur(50px) saturate(180%)",
                  WebkitBackdropFilter: "blur(50px) saturate(180%)",
                }}
              >
                {menu.items.map((item, itemIdx) =>
                  item.separator ? (
                    <div
                      key={`sep-${itemIdx}`}
                      className="h-[1px] bg-white/10 mx-[8px] my-[4px]"
                    />
                  ) : (
                    <button
                      key={item.label}
                      className={`w-full px-[12px] h-[22px] flex items-center justify-between text-[13px] leading-none ${
                        item.disabled
                          ? "text-white/30 cursor-default"
                          : "text-white/90 hover:bg-[#3478f6] hover:text-white rounded-[3px] mx-[4px] w-[calc(100%-8px)]"
                      }`}
                      onClick={() => handleItemClick(item)}
                      disabled={item.disabled}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.shortcut && (
                        <span
                          className={`ml-auto pl-4 text-[12px] ${
                            item.disabled ? "text-white/20" : "text-white/50"
                          }`}
                        >
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right side status icons */}
      <div className="ml-auto flex items-center gap-[2px] h-full">
        {/* Control Center */}
        <button
          className="h-[22px] px-[6px] rounded-[3px] flex items-center hover:bg-white/10 transition-colors"
          onClick={() => onToggleNotifications?.()}
          title="Control Center"
        >
          <svg
            width="14"
            height="12"
            viewBox="0 0 14 12"
            fill="none"
            className="text-white/80"
          >
            <rect x="1" y="1" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <rect x="8" y="1" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <rect x="1" y="7" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <rect x="8" y="7" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>

        {/* Wi-Fi */}
        <button className="h-[22px] px-[6px] rounded-[3px] flex items-center hover:bg-white/10 transition-colors">
          <svg
            width="14"
            height="12"
            viewBox="0 0 16 12"
            fill="none"
            className="text-white/80"
          >
            <path
              d="M8 10.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"
              fill="currentColor"
            />
            <path
              d="M5.5 7.5a3.5 3.5 0 0 1 5 0"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M3.25 5.25a6.5 6.5 0 0 1 9.5 0"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M1 3a9.5 9.5 0 0 1 14 0"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Battery */}
        <div className="h-[22px] px-[6px] rounded-[3px] flex items-center gap-[4px] hover:bg-white/10 transition-colors cursor-default">
          <span className="text-[11px] text-white/60">100%</span>
          <svg
            width="22"
            height="10"
            viewBox="0 0 25 12"
            fill="none"
            className="text-white/80"
          >
            <rect
              x="0.5"
              y="0.5"
              width="20"
              height="11"
              rx="2"
              stroke="currentColor"
              strokeWidth="1"
            />
            <rect
              x="2"
              y="2"
              width="17"
              height="8"
              rx="1"
              fill="currentColor"
              opacity="0.8"
            />
            <rect
              x="21.5"
              y="3.5"
              width="2.5"
              height="5"
              rx="1"
              fill="currentColor"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Date and Time */}
        <button className="h-[22px] px-[8px] rounded-[3px] flex items-center hover:bg-white/10 transition-colors text-[13px] text-white/90 font-medium whitespace-nowrap">
          {date}&ensp;{time}
        </button>
      </div>
    </div>
  );
}
