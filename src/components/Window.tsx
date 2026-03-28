"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useDesktopStore } from "@/lib/store";
import type { WindowState } from "@/lib/types";

interface Props {
  window: WindowState;
  children: React.ReactNode;
}

export default function Window({ window: win, children }: Props) {
  const { closeWindow, updateWindow, focusWindow, minimizeWindow, toggleMaximize } =
    useDesktopStore();
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; winW: number; winH: number; winX: number; winY: number; dir: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Pre-maximize position
  const preMaxRef = useRef({ x: win.x, y: win.y, width: win.width, height: win.height });

  const handleMouseDown = useCallback(() => {
    focusWindow(win.id);
  }, [focusWindow, win.id]);

  // Title bar drag
  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (win.maximized) return;
      e.preventDefault();
      focusWindow(win.id);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        winX: win.x,
        winY: win.y,
      };
      setIsDragging(true);
    },
    [focusWindow, win.id, win.x, win.y, win.maximized]
  );

  // Resize
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, dir: string) => {
      if (win.maximized) return;
      e.preventDefault();
      e.stopPropagation();
      focusWindow(win.id);
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        winW: win.width,
        winH: win.height,
        winX: win.x,
        winY: win.y,
        dir,
      };
      setIsResizing(true);
    },
    [focusWindow, win.id, win.width, win.height, win.x, win.y, win.maximized]
  );

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        updateWindow(win.id, {
          x: dragRef.current.winX + dx,
          y: Math.max(25, dragRef.current.winY + dy), // below menu bar
        });
      }
      if (isResizing && resizeRef.current) {
        const r = resizeRef.current;
        const dx = e.clientX - r.startX;
        const dy = e.clientY - r.startY;
        const updates: Partial<WindowState> = {};

        if (r.dir.includes("e")) updates.width = Math.max(300, r.winW + dx);
        if (r.dir.includes("s")) updates.height = Math.max(200, r.winH + dy);
        if (r.dir.includes("w")) {
          const newW = Math.max(300, r.winW - dx);
          updates.width = newW;
          updates.x = r.winX + (r.winW - newW);
        }
        if (r.dir.includes("n")) {
          const newH = Math.max(200, r.winH - dy);
          updates.height = newH;
          updates.y = Math.max(25, r.winY + (r.winH - newH));
        }

        updateWindow(win.id, updates);
      }
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, win.id, updateWindow]);

  const handleMaxToggle = useCallback(() => {
    if (!win.maximized) {
      preMaxRef.current = { x: win.x, y: win.y, width: win.width, height: win.height };
    }
    toggleMaximize(win.id);
    if (win.maximized) {
      updateWindow(win.id, preMaxRef.current);
    }
  }, [win, toggleMaximize, updateWindow]);

  if (win.minimized) return null;

  const style = win.maximized
    ? { left: 0, top: 25, width: "100vw", height: "calc(100vh - 25px - 70px)", zIndex: win.zIndex }
    : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex };

  return (
    <div
      className="fixed flex flex-col bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl border border-white/10"
      style={style as React.CSSProperties}
      onMouseDown={handleMouseDown}
    >
      {/* Title bar */}
      <div
        className="h-[38px] bg-[#2a2a2a] flex items-center px-3 shrink-0 cursor-default select-none border-b border-white/5"
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={handleMaxToggle}
      >
        {/* Traffic lights */}
        <div className="flex gap-2 mr-3 group">
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(win.id);
            }}
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 flex items-center justify-center text-[8px] text-transparent group-hover:text-black/60 transition-colors"
          >
            ×
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(win.id);
            }}
            className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 flex items-center justify-center text-[8px] text-transparent group-hover:text-black/60 transition-colors"
          >
            −
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMaxToggle();
            }}
            className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 flex items-center justify-center text-[8px] text-transparent group-hover:text-black/60 transition-colors"
          >
            ⤢
          </button>
        </div>

        {/* Title */}
        <span className="text-white/80 text-[13px] font-medium flex-1 text-center mr-[60px] truncate">
          {win.title}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>

      {/* Resize handles */}
      {!win.maximized && (
        <>
          <div className="absolute top-0 left-0 w-1 h-full cursor-w-resize" onMouseDown={(e) => handleResizeMouseDown(e, "w")} />
          <div className="absolute top-0 right-0 w-1 h-full cursor-e-resize" onMouseDown={(e) => handleResizeMouseDown(e, "e")} />
          <div className="absolute bottom-0 left-0 h-1 w-full cursor-s-resize" onMouseDown={(e) => handleResizeMouseDown(e, "s")} />
          <div className="absolute top-0 left-0 h-1 w-full cursor-n-resize" onMouseDown={(e) => handleResizeMouseDown(e, "n")} />
          <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" onMouseDown={(e) => handleResizeMouseDown(e, "se")} />
          <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize" onMouseDown={(e) => handleResizeMouseDown(e, "sw")} />
          <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize" onMouseDown={(e) => handleResizeMouseDown(e, "ne")} />
          <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize" onMouseDown={(e) => handleResizeMouseDown(e, "nw")} />
        </>
      )}
    </div>
  );
}
