"use client";

import { useState, useCallback, useEffect } from "react";
import { useDesktopStore } from "@/lib/store";
import type { WindowState } from "@/lib/types";

interface Props {
  window: WindowState;
}

export default function TextEditApp({ window: win }: Props) {
  const { updateWindow, updateItem, items } = useDesktopStore();
  const fileId = win.data?.fileId as string | null;
  const file = fileId ? items.find((i) => i.id === fileId) : null;
  const [content, setContent] = useState((win.data?.content as string) || file?.content || "");
  const [saved, setSaved] = useState(true);

  // Sync content from file if it changes externally
  useEffect(() => {
    if (file?.content !== undefined && file.content !== content) {
      setContent(file.content);
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setContent(value);
      setSaved(false);
      updateWindow(win.id, { data: { ...win.data, content: value } });
    },
    [updateWindow, win.id, win.data]
  );

  const handleSave = useCallback(() => {
    if (fileId) {
      updateItem(fileId, { content });
      setSaved(true);
    } else {
      // Create new file on desktop
      const { addItem } = useDesktopStore.getState();
      const newFile = addItem({
        name: win.title || "Untitled.txt",
        type: "file",
        x: 80 + Math.random() * 200,
        y: 60 + Math.random() * 200,
        parentId: null,
        content,
      });
      updateWindow(win.id, {
        title: newFile.name,
        data: { ...win.data, fileId: newFile.id, content },
      });
      setSaved(true);
    }
  }, [fileId, content, updateItem, win.id, win.title, win.data, updateWindow]);

  // Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="h-[32px] bg-[#2a2a2a] border-b border-white/5 flex items-center px-3 gap-3 shrink-0 text-[12px]">
        <button
          onClick={handleSave}
          className="text-white/60 hover:text-white transition-colors"
        >
          {saved ? "✓ Saved" : "Save (⌘S)"}
        </button>
        <span className="text-white/30">|</span>
        <span className="text-white/40">{content.length} chars</span>
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 bg-[#1a1a1a] text-white/90 p-4 font-mono text-[13px] leading-relaxed resize-none outline-none"
        spellCheck={false}
        placeholder="Start typing..."
      />
    </div>
  );
}
