"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useDesktopStore } from "@/lib/store";
import type { WindowState } from "@/lib/types";

interface Props {
  window: WindowState;
}

interface Line {
  text: string;
  type: "input" | "output" | "error";
}

export default function TerminalApp({ window: win }: Props) {
  const { items, addItem, deleteItem, updateItem } = useDesktopStore();
  const [lines, setLines] = useState<Line[]>([
    { text: "Welcome to wyattcase.com Terminal", type: "output" },
    { text: 'Type "help" for available commands.', type: "output" },
    { text: "", type: "output" },
  ]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState<string | null>(null); // null = Desktop
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  const cwdName = cwd ? items.find((i) => i.id === cwd)?.name || "?" : "Desktop";

  const addLine = useCallback((text: string, type: Line["type"] = "output") => {
    setLines((prev) => [...prev, { text, type }]);
  }, []);

  const handleCommand = useCallback(
    (cmd: string) => {
      addLine(`wyatt@mac ${cwdName} % ${cmd}`, "input");

      const parts = cmd.trim().split(/\s+/);
      const command = parts[0]?.toLowerCase();
      const args = parts.slice(1);

      switch (command) {
        case "help":
          addLine("Available commands:");
          addLine("  ls         - List files in current directory");
          addLine("  cd <dir>   - Change directory");
          addLine("  mkdir <n>  - Create folder");
          addLine("  touch <n>  - Create file");
          addLine("  cat <file> - Display file contents");
          addLine("  rm <name>  - Delete file or folder");
          addLine("  mv <f> <n> - Rename file");
          addLine("  pwd        - Print working directory");
          addLine("  clear      - Clear terminal");
          addLine("  whoami     - Show user");
          addLine("  date       - Show date");
          addLine("  echo <msg> - Print message");
          addLine("  neofetch   - System info");
          break;

        case "ls": {
          const children = items.filter((i) => i.parentId === cwd);
          if (children.length === 0) {
            addLine("(empty)");
          } else {
            children.forEach((c) => {
              addLine(`  ${c.type === "folder" ? "📁" : "📄"} ${c.name}`);
            });
          }
          break;
        }

        case "cd": {
          if (!args[0] || args[0] === "~" || args[0] === "/") {
            setCwd(null);
          } else if (args[0] === "..") {
            if (cwd) {
              const current = items.find((i) => i.id === cwd);
              setCwd(current?.parentId ?? null);
            }
          } else {
            const target = items.find(
              (i) => i.parentId === cwd && i.type === "folder" && i.name === args[0]
            );
            if (target) {
              setCwd(target.id);
            } else {
              addLine(`cd: no such directory: ${args[0]}`, "error");
            }
          }
          break;
        }

        case "mkdir": {
          if (!args[0]) {
            addLine("mkdir: missing operand", "error");
          } else {
            addItem({
              name: args[0],
              type: "folder",
              x: 80 + Math.random() * 200,
              y: 60 + Math.random() * 200,
              parentId: cwd,
            });
            addLine(`Created folder: ${args[0]}`);
          }
          break;
        }

        case "touch": {
          if (!args[0]) {
            addLine("touch: missing operand", "error");
          } else {
            addItem({
              name: args[0],
              type: "file",
              x: 80 + Math.random() * 200,
              y: 60 + Math.random() * 200,
              parentId: cwd,
              content: "",
            });
            addLine(`Created file: ${args[0]}`);
          }
          break;
        }

        case "cat": {
          if (!args[0]) {
            addLine("cat: missing operand", "error");
          } else {
            const file = items.find(
              (i) => i.parentId === cwd && i.name === args[0] && i.type === "file"
            );
            if (file) {
              addLine(file.content || "(empty file)");
            } else {
              addLine(`cat: ${args[0]}: No such file`, "error");
            }
          }
          break;
        }

        case "rm": {
          if (!args[0]) {
            addLine("rm: missing operand", "error");
          } else {
            const target = items.find(
              (i) => i.parentId === cwd && i.name === args[0]
            );
            if (target) {
              deleteItem(target.id);
              addLine(`Deleted: ${args[0]}`);
            } else {
              addLine(`rm: ${args[0]}: No such file or directory`, "error");
            }
          }
          break;
        }

        case "mv": {
          if (args.length < 2) {
            addLine("mv: missing operand", "error");
          } else {
            const target = items.find(
              (i) => i.parentId === cwd && i.name === args[0]
            );
            if (target) {
              updateItem(target.id, { name: args[1] });
              addLine(`Renamed ${args[0]} → ${args[1]}`);
            } else {
              addLine(`mv: ${args[0]}: No such file or directory`, "error");
            }
          }
          break;
        }

        case "pwd":
          addLine(cwd ? `/${getPath(items, cwd)}` : "/Desktop");
          break;

        case "clear":
          setLines([]);
          break;

        case "whoami":
          addLine("wyatt");
          break;

        case "date":
          addLine(new Date().toString());
          break;

        case "echo":
          addLine(args.join(" "));
          break;

        case "neofetch":
          addLine("   ╭──────────────────╮");
          addLine("   │   wyattcase.com   │");
          addLine("   ╰──────────────────╯");
          addLine(`   OS: macOS Web Edition`);
          addLine(`   Host: Vercel Edge`);
          addLine(`   Shell: wyatt-sh 1.0`);
          addLine(`   Resolution: ${window.innerWidth}x${window.innerHeight}`);
          addLine(`   Files: ${items.length}`);
          addLine(`   Uptime: since you opened the tab`);
          break;

        case "":
          break;

        default:
          addLine(`command not found: ${command}`, "error");
      }
    },
    [items, cwd, cwdName, addItem, deleteItem, updateItem, addLine]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleCommand(input);
        setInput("");
      }
    },
    [input, handleCommand]
  );

  // Keep win in scope to satisfy linting
  void win;

  return (
    <div
      className="h-full bg-[#1a1a1a] flex flex-col font-mono text-[13px] text-green-400"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.type === "input"
                ? "text-white"
                : line.type === "error"
                ? "text-red-400"
                : "text-green-400/80"
            }
            style={{ whiteSpace: "pre-wrap" }}
          >
            {line.text}
          </div>
        ))}
        {/* Input line */}
        <div className="flex text-white">
          <span className="text-blue-400 mr-1">wyatt@mac</span>
          <span className="text-cyan-400 mr-1">{cwdName}</span>
          <span className="text-white mr-1">%</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white caret-green-400"
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}

function getPath(items: { id: string; name: string; parentId: string | null }[], id: string): string {
  const item = items.find((i) => i.id === id);
  if (!item) return "";
  if (!item.parentId) return item.name;
  return getPath(items, item.parentId) + "/" + item.name;
}
