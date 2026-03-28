"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useDesktopStore } from "@/lib/store";
import type { WindowState } from "@/lib/types";

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
const MENU_BAR_HEIGHT = 25;
const DOCK_HEIGHT = 70;
const SNAP_THRESHOLD = 12;
const RESIZE_HANDLE = 6;
const CORNER_HANDLE = 12;

interface Props {
  window: WindowState;
  children: React.ReactNode;
  isActive: boolean;
}

export default function Window({ window: win, children, isActive }: Props) {
  const { closeWindow, updateWindow, focusWindow, minimizeWindow, toggleMaximize } =
    useDesktopStore();

  const dragRef = useRef<{
    startX: number;
    startY: number;
    winX: number;
    winY: number;
  } | null>(null);

  const resizeRef = useRef<{
    startX: number;
    startY: number;
    winW: number;
    winH: number;
    winX: number;
    winY: number;
    dir: string;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const [trafficHovered, setTrafficHovered] = useState(false);

  // Store pre-maximize geometry so we can restore it
  const preMaxRef = useRef({ x: win.x, y: win.y, width: win.width, height: win.height });

  // Keep preMaxRef in sync when not maximized
  useEffect(() => {
    if (!win.maximized) {
      preMaxRef.current = { x: win.x, y: win.y, width: win.width, height: win.height };
    }
  }, [win.x, win.y, win.width, win.height, win.maximized]);

  const handleMouseDown = useCallback(() => {
    focusWindow(win.id);
  }, [focusWindow, win.id]);

  // --- Title bar drag ---
  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Don't start drag from traffic lights
      if ((e.target as HTMLElement).closest("[data-traffic-lights]")) return;
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

  // --- Resize ---
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

  // --- Mouse move / up handlers ---
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        let newX = dragRef.current.winX + dx;
        let newY = Math.max(MENU_BAR_HEIGHT, dragRef.current.winY + dy);

        // Snap to screen edges
        const vw = globalThis.innerWidth;
        const vh = globalThis.innerHeight;

        if (Math.abs(newX) < SNAP_THRESHOLD) newX = 0;
        if (Math.abs(newY - MENU_BAR_HEIGHT) < SNAP_THRESHOLD) newY = MENU_BAR_HEIGHT;
        if (Math.abs(newX + win.width - vw) < SNAP_THRESHOLD) newX = vw - win.width;
        if (Math.abs(newY + win.height - (vh - DOCK_HEIGHT)) < SNAP_THRESHOLD) {
          newY = vh - DOCK_HEIGHT - win.height;
        }

        updateWindow(win.id, { x: newX, y: newY });
      }

      if (isResizing && resizeRef.current) {
        const r = resizeRef.current;
        const dx = e.clientX - r.startX;
        const dy = e.clientY - r.startY;
        const updates: Partial<WindowState> = {};

        if (r.dir.includes("e")) {
          updates.width = Math.max(MIN_WIDTH, r.winW + dx);
        }
        if (r.dir.includes("s")) {
          updates.height = Math.max(MIN_HEIGHT, r.winH + dy);
        }
        if (r.dir.includes("w")) {
          const newW = Math.max(MIN_WIDTH, r.winW - dx);
          updates.width = newW;
          updates.x = r.winX + (r.winW - newW);
        }
        if (r.dir.includes("n")) {
          const newH = Math.max(MIN_HEIGHT, r.winH - dy);
          updates.height = newH;
          updates.y = Math.max(MENU_BAR_HEIGHT, r.winY + (r.winH - newH));
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

    globalThis.addEventListener("mousemove", handleMouseMove);
    globalThis.addEventListener("mouseup", handleMouseUp);
    return () => {
      globalThis.removeEventListener("mousemove", handleMouseMove);
      globalThis.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, win.id, win.width, win.height, updateWindow]);

  // --- Maximize / restore ---
  const handleMaxToggle = useCallback(() => {
    if (!win.maximized) {
      preMaxRef.current = { x: win.x, y: win.y, width: win.width, height: win.height };
      toggleMaximize(win.id);
    } else {
      toggleMaximize(win.id);
      updateWindow(win.id, preMaxRef.current);
    }
  }, [win.id, win.x, win.y, win.width, win.height, win.maximized, toggleMaximize, updateWindow]);

  // --- Minimize with animation ---
  const handleMinimize = useCallback(() => {
    setIsMinimizing(true);
    setTimeout(() => {
      minimizeWindow(win.id);
      setIsMinimizing(false);
    }, 300);
  }, [minimizeWindow, win.id]);

  // --- Green button with Option key ---
  const handleGreen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.altKey) {
        // Option+click: zoom to fit content (use a sensible default)
        if (!win.maximized) {
          preMaxRef.current = { x: win.x, y: win.y, width: win.width, height: win.height };
        }
        const vw = globalThis.innerWidth;
        const vh = globalThis.innerHeight;
        const fitW = Math.min(800, vw - 100);
        const fitH = Math.min(600, vh - MENU_BAR_HEIGHT - DOCK_HEIGHT - 40);
        updateWindow(win.id, {
          x: Math.round((vw - fitW) / 2),
          y: MENU_BAR_HEIGHT + 20,
          width: fitW,
          height: fitH,
          maximized: false,
        });
      } else {
        handleMaxToggle();
      }
    },
    [handleMaxToggle, win, updateWindow]
  );

  if (win.minimized && !isMinimizing) return null;

  // --- Positioning ---
  const style: React.CSSProperties = win.maximized
    ? {
        left: 0,
        top: MENU_BAR_HEIGHT,
        width: "100vw",
        height: `calc(100vh - ${MENU_BAR_HEIGHT}px - ${DOCK_HEIGHT}px)`,
        zIndex: win.zIndex,
        borderRadius: 0,
      }
    : {
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
      };

  // Minimize animation transform
  if (isMinimizing) {
    style.transform = "scale(0.15) translateY(80vh)";
    style.opacity = 0;
    style.transition = "transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease";
  }

  // Traffic light colors
  const tlRed = isActive ? "#ff5f57" : "#4e4e4e";
  const tlYellow = isActive ? "#febc2e" : "#4e4e4e";
  const tlGreen = isActive ? "#28c840" : "#4e4e4e";

  const tlRedBorder = isActive ? "#e14640" : "#3a3a3a";
  const tlYellowBorder = isActive ? "#dea123" : "#3a3a3a";
  const tlGreenBorder = isActive ? "#1eab2f" : "#3a3a3a";

  return (
    <div
      className="fixed flex flex-col overflow-hidden select-none"
      style={{
        ...style,
        borderRadius: win.maximized ? 0 : 10,
        boxShadow: isActive
          ? "0 22px 70px 4px rgba(0,0,0,0.56), 0 0 0 0.5px rgba(0,0,0,0.3)"
          : "0 8px 30px 2px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(0,0,0,0.2)",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Title bar */}
      <div
        className="shrink-0 flex items-center px-[13px] cursor-default"
        style={{
          height: 38,
          background: isActive
            ? "linear-gradient(180deg, #3c3c3c 0%, #2d2d2d 100%)"
            : "#282828",
          borderBottom: isActive
            ? "1px solid rgba(255,255,255,0.08)"
            : "1px solid rgba(255,255,255,0.04)",
        }}
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={handleMaxToggle}
      >
        {/* Traffic lights */}
        <div
          data-traffic-lights
          className="flex items-center gap-2 mr-3"
          onMouseEnter={() => setTrafficHovered(true)}
          onMouseLeave={() => setTrafficHovered(false)}
        >
          {/* Close (red) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(win.id);
            }}
            className="flex items-center justify-center transition-colors"
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: tlRed,
              boxShadow: `inset 0 0 0 0.5px ${tlRedBorder}`,
            }}
            aria-label="Close window"
          >
            {trafficHovered && (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                <path d="M0.5 0.5L5.5 5.5M5.5 0.5L0.5 5.5" stroke="rgba(0,0,0,0.55)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            )}
          </button>

          {/* Minimize (yellow) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleMinimize();
            }}
            className="flex items-center justify-center transition-colors"
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: tlYellow,
              boxShadow: `inset 0 0 0 0.5px ${tlYellowBorder}`,
            }}
            aria-label="Minimize window"
          >
            {trafficHovered && (
              <svg width="6" height="2" viewBox="0 0 6 2" fill="none">
                <path d="M0.5 1H5.5" stroke="rgba(0,0,0,0.55)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            )}
          </button>

          {/* Maximize / fullscreen (green) */}
          <button
            type="button"
            onClick={handleGreen}
            className="flex items-center justify-center transition-colors"
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: tlGreen,
              boxShadow: `inset 0 0 0 0.5px ${tlGreenBorder}`,
            }}
            aria-label="Maximize window"
          >
            {trafficHovered && (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                {/* Expand arrows icon */}
                <path d="M5.5 0.5L3.5 0.5L5.5 2.5V0.5Z" fill="rgba(0,0,0,0.55)" />
                <path d="M0.5 5.5L2.5 5.5L0.5 3.5V5.5Z" fill="rgba(0,0,0,0.55)" />
              </svg>
            )}
          </button>
        </div>

        {/* Title text */}
        <span
          className="flex-1 text-center truncate pointer-events-none"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)",
            marginRight: 60, // offset for traffic lights width
          }}
        >
          {win.title}
        </span>
      </div>

      {/* Content area */}
      <div
        className="flex-1 overflow-hidden relative"
        style={{ background: "#1e1e1e" }}
      >
        {/* Subtle inner shadow at top of content */}
        <div
          className="absolute inset-x-0 top-0 h-[3px] pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 100%)",
            zIndex: 1,
          }}
        />
        <div className="h-full w-full">{children}</div>
      </div>

      {/* Resize handles (all edges + corners) */}
      {!win.maximized && (
        <>
          {/* Edges */}
          <div
            className="absolute top-0 left-[10px] right-[10px] cursor-n-resize"
            style={{ height: RESIZE_HANDLE }}
            onMouseDown={(e) => handleResizeMouseDown(e, "n")}
          />
          <div
            className="absolute bottom-0 left-[10px] right-[10px] cursor-s-resize"
            style={{ height: RESIZE_HANDLE }}
            onMouseDown={(e) => handleResizeMouseDown(e, "s")}
          />
          <div
            className="absolute left-0 top-[10px] bottom-[10px] cursor-w-resize"
            style={{ width: RESIZE_HANDLE }}
            onMouseDown={(e) => handleResizeMouseDown(e, "w")}
          />
          <div
            className="absolute right-0 top-[10px] bottom-[10px] cursor-e-resize"
            style={{ width: RESIZE_HANDLE }}
            onMouseDown={(e) => handleResizeMouseDown(e, "e")}
          />
          {/* Corners */}
          <div
            className="absolute top-0 left-0 cursor-nw-resize"
            style={{ width: CORNER_HANDLE, height: CORNER_HANDLE }}
            onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
          />
          <div
            className="absolute top-0 right-0 cursor-ne-resize"
            style={{ width: CORNER_HANDLE, height: CORNER_HANDLE }}
            onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
          />
          <div
            className="absolute bottom-0 left-0 cursor-sw-resize"
            style={{ width: CORNER_HANDLE, height: CORNER_HANDLE }}
            onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
          />
          <div
            className="absolute bottom-0 right-0 cursor-se-resize"
            style={{ width: CORNER_HANDLE, height: CORNER_HANDLE }}
            onMouseDown={(e) => handleResizeMouseDown(e, "se")}
          />
        </>
      )}
    </div>
  );
}
