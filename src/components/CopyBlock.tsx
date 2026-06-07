"use client";

import { useState } from "react";

// A labeled, copy-to-clipboard text block for the /hidden Upwork asset kit.
export function CopyBlock({
  label,
  hint,
  text,
  rows,
}: {
  label: string;
  hint?: string;
  text: string;
  rows?: number;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for browsers without clipboard API.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-2.5 flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-300/90">
            {label}
          </div>
          {hint ? (
            <div className="mt-0.5 text-[12px] font-light text-white/45">{hint}</div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={copy}
          className={`shrink-0 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
            copied
              ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
              : "border-white/15 bg-white/5 text-white/80 hover:bg-white/15"
          }`}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre
        className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black/30 p-3.5 font-mono text-[12.5px] leading-relaxed text-white/80"
        style={rows ? { maxHeight: `${rows * 1.6}em` } : undefined}
      >
        {text}
      </pre>
    </div>
  );
}
