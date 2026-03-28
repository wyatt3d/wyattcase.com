"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useDesktopStore } from "@/lib/store";
import type { WindowState } from "@/lib/types";

interface Note {
  id: string;
  content: string;
  createdAt: number;
  modifiedAt: number;
  folder: string;
  deleted: boolean;
}

interface Props {
  window: WindowState;
}

const STORAGE_KEY = "wyattcase-notes";

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function loadNotes(): Note[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [
    {
      id: generateId(),
      content: "Welcome to Notes\nThis is your first note. Start typing to edit it.\n\nYou can create new notes, organize them into folders, and format your text using the toolbar above.",
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      folder: "all",
      deleted: false,
    },
  ];
}

function saveNotes(notes: Note[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // localStorage might be full
  }
}

function getTitle(content: string): string {
  const firstLine = content.split("\n")[0]?.trim();
  return firstLine || "New Note";
}

function getPreview(content: string): string {
  const lines = content.split("\n");
  const secondLine = lines.slice(1).find((l) => l.trim().length > 0)?.trim();
  return secondLine || "No additional text";
}

function formatDate(ts: number): string {
  const now = new Date();
  const date = new Date(ts);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "long" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

type Folder = "all" | "deleted";

export default function NotesApp({ window: win }: Props) {
  const { updateWindow } = useDesktopStore();
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [selectedFolder, setSelectedFolder] = useState<Folder>("all");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposingRef = useRef(false);

  // Persist notes on change
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Filter notes based on folder and search
  const filteredNotes = notes
    .filter((n) => {
      if (selectedFolder === "deleted") return n.deleted;
      return !n.deleted;
    })
    .filter((n) => {
      if (!searchQuery) return true;
      return n.content.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => b.modifiedAt - a.modifiedAt);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null;

  // Auto-select first note when folder changes or selection becomes invalid
  useEffect(() => {
    const currentStillVisible = filteredNotes.some((n) => n.id === selectedNoteId);
    if (!currentStillVisible && filteredNotes.length > 0) {
      setSelectedNoteId(filteredNotes[0].id);
    } else if (filteredNotes.length === 0) {
      setSelectedNoteId(null);
    }
  }, [selectedFolder, searchQuery, filteredNotes, selectedNoteId]);

  // Sync editor content when selected note changes
  useEffect(() => {
    if (editorRef.current && selectedNote) {
      if (editorRef.current.innerText !== selectedNote.content) {
        editorRef.current.innerText = selectedNote.content;
      }
    } else if (editorRef.current && !selectedNote) {
      editorRef.current.innerText = "";
    }
  }, [selectedNoteId, selectedNote]);

  // Update window title
  useEffect(() => {
    const title = selectedNote ? getTitle(selectedNote.content) : "Notes";
    if (win.title !== title) {
      updateWindow(win.id, { title });
    }
  }, [selectedNote, updateWindow, win.id, win.title]);

  const handleCreateNote = useCallback(() => {
    if (selectedFolder === "deleted") setSelectedFolder("all");
    const newNote: Note = {
      id: generateId(),
      content: "",
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      folder: "all",
      deleted: false,
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    // Focus editor after creation
    setTimeout(() => editorRef.current?.focus(), 50);
  }, [selectedFolder]);

  const handleDeleteNote = useCallback(() => {
    if (!selectedNoteId) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedNoteId
          ? { ...n, deleted: true, modifiedAt: Date.now() }
          : n
      )
    );
  }, [selectedNoteId]);

  const handlePermanentDelete = useCallback(() => {
    if (!selectedNoteId) return;
    setNotes((prev) => prev.filter((n) => n.id !== selectedNoteId));
  }, [selectedNoteId]);

  const handleRestoreNote = useCallback(() => {
    if (!selectedNoteId) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedNoteId
          ? { ...n, deleted: false, modifiedAt: Date.now() }
          : n
      )
    );
  }, [selectedNoteId]);

  const handleEditorInput = useCallback(() => {
    if (!editorRef.current || !selectedNoteId || isComposingRef.current) return;
    const newContent = editorRef.current.innerText;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedNoteId
          ? { ...n, content: newContent, modifiedAt: Date.now() }
          : n
      )
    );
  }, [selectedNoteId]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  const allCount = notes.filter((n) => !n.deleted).length;
  const deletedCount = notes.filter((n) => n.deleted).length;

  return (
    <div className="h-full flex bg-[#1e1e1e] text-white/90 text-[13px] select-none">
      {/* Folders Sidebar */}
      <div className="w-[180px] bg-[#2a2a2a]/80 border-r border-white/[0.06] flex flex-col shrink-0">
        <div className="h-[12px] shrink-0" />
        {/* Search */}
        <div className="px-2.5 pb-2">
          <div className="relative">
            <svg
              className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-white/[0.06] rounded-md text-[12px] text-white/80 placeholder:text-white/30 pl-7 pr-2 py-[5px] outline-none focus:bg-white/[0.1] transition-colors"
            />
          </div>
        </div>

        <div className="px-2 flex flex-col gap-0.5">
          <button
            onClick={() => setSelectedFolder("all")}
            className={`flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-left transition-colors ${
              selectedFolder === "all"
                ? "bg-[#4a90d9]/80 text-white"
                : "text-white/70 hover:bg-white/[0.06]"
            }`}
          >
            <svg className="w-4 h-4 shrink-0 text-[#f5c542]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M2 9v5a2 2 0 002 2h12a2 2 0 002-2V9H2zm4 3a1 1 0 011-1h6a1 1 0 010 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="flex-1 truncate text-[12px]">All Notes</span>
            <span className="text-[11px] text-white/40">{allCount}</span>
          </button>

          <button
            onClick={() => setSelectedFolder("deleted")}
            className={`flex items-center gap-2.5 px-2.5 py-[6px] rounded-md text-left transition-colors ${
              selectedFolder === "deleted"
                ? "bg-[#4a90d9]/80 text-white"
                : "text-white/70 hover:bg-white/[0.06]"
            }`}
          >
            <svg className="w-4 h-4 shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            <span className="flex-1 truncate text-[12px]">Recently Deleted</span>
            <span className="text-[11px] text-white/40">{deletedCount}</span>
          </button>
        </div>

        {/* New note button at bottom */}
        <div className="mt-auto p-2 border-t border-white/[0.06]">
          <button
            onClick={handleCreateNote}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-[5px] text-[12px] text-[#f5c542] hover:bg-white/[0.06] rounded-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="w-[220px] bg-[#252525] border-r border-white/[0.06] flex flex-col shrink-0">
        <div className="px-3 py-2 border-b border-white/[0.06]">
          <div className="text-[12px] font-semibold text-white/50 uppercase tracking-wider">
            {selectedFolder === "all" ? "All Notes" : "Recently Deleted"}
          </div>
          <div className="text-[11px] text-white/30 mt-0.5">
            {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setSelectedNoteId(note.id)}
              className={`w-full text-left px-3 py-2.5 border-b border-white/[0.04] transition-colors ${
                selectedNoteId === note.id
                  ? "bg-[#4a90d9]/70"
                  : "hover:bg-white/[0.04]"
              }`}
            >
              <div className="text-[13px] font-medium text-white/90 truncate">
                {getTitle(note.content)}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-white/40 shrink-0">
                  {formatDate(note.modifiedAt)}
                </span>
                <span className="text-[11px] text-white/30 truncate">
                  {getPreview(note.content)}
                </span>
              </div>
            </button>
          ))}

          {filteredNotes.length === 0 && (
            <div className="px-3 py-8 text-center text-[12px] text-white/30">
              {searchQuery ? "No matching notes" : "No notes"}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedNote ? (
          <>
            {/* Toolbar */}
            <div className="h-[38px] bg-[#2a2a2a] border-b border-white/[0.06] flex items-center px-2 gap-1 shrink-0">
              {selectedNote.deleted ? (
                <>
                  <button
                    onClick={handleRestoreNote}
                    className="px-2.5 py-1 text-[12px] text-[#4a90d9] hover:bg-white/[0.06] rounded transition-colors"
                  >
                    Restore
                  </button>
                  <button
                    onClick={handlePermanentDelete}
                    className="px-2.5 py-1 text-[12px] text-red-400 hover:bg-white/[0.06] rounded transition-colors"
                  >
                    Delete Forever
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => execCommand("bold")}
                    className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] rounded transition-colors font-bold text-[13px]"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    onClick={() => execCommand("italic")}
                    className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] rounded transition-colors italic text-[13px]"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    onClick={() => execCommand("underline")}
                    className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] rounded transition-colors underline text-[13px]"
                    title="Underline"
                  >
                    U
                  </button>

                  <div className="w-px h-4 bg-white/10 mx-1" />

                  <button
                    onClick={() => execCommand("insertUnorderedList")}
                    className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] rounded transition-colors"
                    title="Bulleted List"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                    </svg>
                  </button>
                  <button
                    onClick={() => execCommand("insertOrderedList")}
                    className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] rounded transition-colors"
                    title="Numbered List"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" d="M8 6h13M8 12h13M8 18h13" />
                      <text x="1" y="8" fontSize="7" fill="currentColor" stroke="none" fontFamily="system-ui">1</text>
                      <text x="1" y="14" fontSize="7" fill="currentColor" stroke="none" fontFamily="system-ui">2</text>
                      <text x="1" y="20" fontSize="7" fill="currentColor" stroke="none" fontFamily="system-ui">3</text>
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const sel = window.getSelection();
                      if (!sel || !sel.rangeCount) return;
                      const range = sel.getRangeAt(0);
                      const checkbox = document.createElement("span");
                      checkbox.contentEditable = "false";
                      checkbox.innerHTML = "☐ ";
                      checkbox.style.cursor = "pointer";
                      checkbox.style.userSelect = "none";
                      checkbox.onclick = () => {
                        checkbox.innerHTML = checkbox.innerHTML.includes("☐") ? "☑ " : "☐ ";
                        handleEditorInput();
                      };
                      range.insertNode(checkbox);
                      range.collapse(false);
                      sel.removeAllRanges();
                      sel.addRange(range);
                      handleEditorInput();
                    }}
                    className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] rounded transition-colors"
                    title="Checklist"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <path strokeLinecap="round" d="M13 6h8M13 18h8" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16l2.5 2.5L10 14" />
                    </svg>
                  </button>

                  <div className="flex-1" />

                  <button
                    onClick={handleDeleteNote}
                    className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-white/[0.06] rounded transition-colors"
                    title="Delete Note"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto bg-[#fefcf3]">
              <div
                ref={editorRef}
                contentEditable={!selectedNote.deleted}
                suppressContentEditableWarning
                onInput={handleEditorInput}
                onCompositionStart={() => { isComposingRef.current = true; }}
                onCompositionEnd={() => {
                  isComposingRef.current = false;
                  handleEditorInput();
                }}
                className="min-h-full p-6 text-[14px] leading-relaxed text-[#3a3a3a] outline-none whitespace-pre-wrap [&>*]:mb-1"
                style={{
                  fontFamily: '-apple-system, "Helvetica Neue", sans-serif',
                  caretColor: "#e8a530",
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
            <div className="text-center text-white/20">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <p className="text-[13px]">No note selected</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
