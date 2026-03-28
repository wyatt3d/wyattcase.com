"use client";

import { useEffect, useRef } from "react";
import { useDesktopStore } from "@/lib/store";

export default function ContextMenu() {
  const { contextMenu, hideContextMenu } = useDesktopStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = () => hideContextMenu();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") hideContextMenu();
    };
    window.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [hideContextMenu]);

  if (!contextMenu) return null;

  // Adjust position to stay in viewport
  const x = Math.min(contextMenu.x, window.innerWidth - 220);
  const y = Math.min(contextMenu.y, window.innerHeight - contextMenu.items.length * 32 - 20);

  return (
    <div
      ref={ref}
      className="fixed z-[10000] min-w-[200px] bg-[rgba(40,40,40,0.95)] backdrop-blur-2xl rounded-lg border border-white/15 shadow-2xl py-1 text-[13px] text-white"
      style={{ left: x, top: y }}
    >
      {contextMenu.items.map((item, i) =>
        item.separator ? (
          <div key={i} className="h-px bg-white/10 my-1 mx-2" />
        ) : (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              item.action();
              hideContextMenu();
            }}
            disabled={item.disabled}
            className="w-full text-left px-3 py-1 hover:bg-[#3478f6] rounded-[4px] mx-0.5 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            style={{ width: "calc(100% - 4px)" }}
          >
            {item.label}
          </button>
        )
      )}
    </div>
  );
}
