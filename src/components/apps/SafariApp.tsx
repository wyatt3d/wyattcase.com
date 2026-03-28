"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { WindowState } from "@/lib/types";
import { useDesktopStore } from "@/lib/store";

interface Tab {
  id: string;
  title: string;
  url: string;
  loading: boolean;
  error: boolean;
}

interface Props {
  window: WindowState;
}

const BOOKMARKS = [
  { label: "GitHub", url: "https://github.com" },
  { label: "Vercel", url: "https://vercel.com" },
  { label: "Google", url: "https://www.google.com/webhp?igu=1" },
  { label: "Wikipedia", url: "https://en.m.wikipedia.org" },
  { label: "Hacker News", url: "https://news.ycombinator.com" },
];

const DEFAULT_URL = "https://en.m.wikipedia.org";

function generateTabId() {
  return Math.random().toString(36).slice(2, 10);
}

function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url) return DEFAULT_URL;
  // If it looks like a search query (no dots, no protocol)
  if (!/[.]/.test(url) && !/^https?:\/\//.test(url)) {
    return `https://www.google.com/search?igu=1&q=${encodeURIComponent(url)}`;
  }
  if (!/^https?:\/\//.test(url)) {
    url = "https://" + url;
  }
  return url;
}

function extractDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return url;
  }
}

export default function SafariApp({ window: win }: Props) {
  const { updateWindow } = useDesktopStore();

  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: generateTabId(),
      title: "Wikipedia",
      url: DEFAULT_URL,
      loading: true,
      error: false,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [urlBarValue, setUrlBarValue] = useState(DEFAULT_URL);
  const [urlBarFocused, setUrlBarFocused] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  // Sync URL bar when switching tabs
  useEffect(() => {
    if (!urlBarFocused && activeTab) {
      setUrlBarValue(activeTab.url);
    }
  }, [activeTabId, activeTab, urlBarFocused]);

  // Update window title
  useEffect(() => {
    if (activeTab) {
      updateWindow(win.id, { title: activeTab.title || "Safari" });
    }
  }, [activeTab?.title, updateWindow, win.id, activeTab]);

  const updateTab = useCallback(
    (tabId: string, updates: Partial<Tab>) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === tabId ? { ...t, ...updates } : t))
      );
    },
    []
  );

  const navigateTo = useCallback(
    (url: string, tabId?: string) => {
      const targetId = tabId ?? activeTabId;
      const normalized = normalizeUrl(url);
      updateTab(targetId, {
        url: normalized,
        loading: true,
        error: false,
        title: extractDomain(normalized),
      });
      setUrlBarValue(normalized);
    },
    [activeTabId, updateTab]
  );

  const addTab = useCallback(() => {
    const newTab: Tab = {
      id: generateTabId(),
      title: "New Tab",
      url: "",
      loading: false,
      error: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setUrlBarValue("");
    // Focus URL bar for new tab
    setTimeout(() => urlInputRef.current?.focus(), 50);
  }, []);

  const closeTab = useCallback(
    (tabId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setTabs((prev) => {
        const next = prev.filter((t) => t.id !== tabId);
        if (next.length === 0) {
          // Add a fresh tab if closing last one
          const fresh: Tab = {
            id: generateTabId(),
            title: "New Tab",
            url: "",
            loading: false,
            error: false,
          };
          setActiveTabId(fresh.id);
          setUrlBarValue("");
          return [fresh];
        }
        if (activeTabId === tabId) {
          const idx = prev.findIndex((t) => t.id === tabId);
          const newActive = next[Math.min(idx, next.length - 1)];
          setActiveTabId(newActive.id);
          setUrlBarValue(newActive.url);
        }
        return next;
      });
    },
    [activeTabId]
  );

  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const handleUrlSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      navigateTo(urlBarValue);
      urlInputRef.current?.blur();
    },
    [urlBarValue, navigateTo]
  );

  const handleIframeLoad = useCallback(() => {
    updateTab(activeTabId, { loading: false });
    // Try to get the title from the iframe
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc?.title) {
        updateTab(activeTabId, { title: doc.title });
      }
    } catch {
      // Cross-origin - use domain as title
      updateTab(activeTabId, { title: extractDomain(activeTab?.url ?? "") });
    }
  }, [activeTabId, activeTab?.url, updateTab]);

  const handleIframeError = useCallback(() => {
    updateTab(activeTabId, { loading: false, error: true });
  }, [activeTabId, updateTab]);

  return (
    <div className="flex flex-col h-full bg-white text-[13px] select-none">
      {/* Tab Bar */}
      <div className="flex items-end bg-[#dddcdb] pt-1 px-1 gap-[1px] shrink-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => switchTab(tab.id)}
            className={`group relative flex items-center gap-1.5 min-w-[120px] max-w-[220px] px-3 py-[6px] text-[12px] rounded-t-lg transition-colors ${
              tab.id === activeTabId
                ? "bg-[#f1f0ef] text-[#333] z-10"
                : "bg-[#cccbca] text-[#666] hover:bg-[#d8d7d6]"
            }`}
          >
            {/* Favicon placeholder */}
            <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
              {tab.loading ? (
                <svg
                  className="w-3 h-3 animate-spin text-[#999]"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="28"
                    strokeDashoffset="8"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3.5 h-3.5 text-[#999]"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M2 2h12v12H2V2zm1 1v10h10V3H3z" />
                </svg>
              )}
            </span>
            <span className="truncate flex-1 text-left">{tab.title || "New Tab"}</span>
            {/* Close button */}
            <span
              onClick={(e) => closeTab(tab.id, e)}
              className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] leading-none flex-shrink-0 transition-colors ${
                tab.id === activeTabId
                  ? "opacity-60 hover:opacity-100 hover:bg-[#ccc]"
                  : "opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-[#bbb]"
              }`}
            >
              ✕
            </span>
          </button>
        ))}
        {/* New Tab button */}
        <button
          onClick={addTab}
          className="flex items-center justify-center w-7 h-7 mb-[1px] text-[#888] hover:text-[#555] hover:bg-[#c5c4c3] rounded transition-colors flex-shrink-0"
          title="New Tab"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          </svg>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-[6px] bg-[#f1f0ef] border-b border-[#c8c7c6] shrink-0">
        {/* Back / Forward */}
        <div className="flex items-center gap-0.5">
          <button
            className="w-7 h-7 flex items-center justify-center rounded text-[#555] hover:bg-[#ddd] transition-colors disabled:opacity-30"
            disabled
            title="Go Back"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
          </button>
          <button
            className="w-7 h-7 flex items-center justify-center rounded text-[#555] hover:bg-[#ddd] transition-colors disabled:opacity-30"
            disabled
            title="Go Forward"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
        </div>

        {/* URL Bar */}
        <form onSubmit={handleUrlSubmit} className="flex-1 relative">
          <div className="flex items-center bg-white border border-[#c5c5c5] rounded-lg h-[30px] px-3 gap-2 focus-within:border-[#0a84ff] focus-within:ring-2 focus-within:ring-[#0a84ff]/30 transition-all">
            {/* Lock icon (shown when a URL is loaded) */}
            {activeTab?.url && !urlBarFocused && (
              <svg
                className="w-3 h-3 text-[#888] flex-shrink-0"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M4 7V5a4 4 0 118 0v2h1a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1h1zm2-2a2 2 0 114 0v2H6V5zm2 5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
              </svg>
            )}
            <input
              ref={urlInputRef}
              type="text"
              value={urlBarFocused ? urlBarValue : (activeTab?.url ? extractDomain(activeTab.url) : "")}
              onChange={(e) => setUrlBarValue(e.target.value)}
              onFocus={() => {
                setUrlBarFocused(true);
                setUrlBarValue(activeTab?.url ?? "");
                // Select all text on focus
                setTimeout(() => urlInputRef.current?.select(), 0);
              }}
              onBlur={() => setUrlBarFocused(false)}
              placeholder="Search or enter website name"
              className="flex-1 bg-transparent text-[12px] text-center text-[#333] placeholder:text-[#aaa] outline-none"
              spellCheck={false}
            />
            {/* Loading indicator in URL bar */}
            {activeTab?.loading && (
              <svg
                className="w-3 h-3 animate-spin text-[#888] flex-shrink-0"
                viewBox="0 0 16 16"
                fill="none"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="28"
                  strokeDashoffset="8"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        </form>

        {/* Share button */}
        <button
          className="w-7 h-7 flex items-center justify-center rounded text-[#555] hover:bg-[#ddd] transition-colors"
          title="Share"
          onClick={() => {
            if (activeTab?.url) {
              navigator.clipboard?.writeText(activeTab.url);
            }
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v8M5 5l3-3 3 3" />
            <path d="M3 10v3a1 1 0 001 1h8a1 1 0 001-1v-3" />
          </svg>
        </button>
      </div>

      {/* Bookmarks Bar */}
      <div className="flex items-center gap-1 px-3 py-[3px] bg-[#f6f5f4] border-b border-[#ddd] shrink-0 overflow-x-auto">
        {BOOKMARKS.map((bm) => (
          <button
            key={bm.label}
            onClick={() => navigateTo(bm.url)}
            className="flex items-center gap-1 px-2 py-[2px] rounded text-[11px] text-[#555] hover:bg-[#e5e4e3] transition-colors whitespace-nowrap"
          >
            <svg className="w-3 h-3 text-[#999] flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2h12v12H2V2zm1 1v10h10V3H3z" />
            </svg>
            {bm.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 relative bg-white overflow-hidden">
        {activeTab?.error ? (
          <div className="flex flex-col items-center justify-center h-full text-[#666] gap-3 px-8">
            <svg
              className="w-12 h-12 text-[#ccc]"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="24" cy="24" r="20" />
              <path d="M24 14v12M24 30v2" strokeLinecap="round" />
            </svg>
            <div className="text-center">
              <div className="text-[15px] font-medium text-[#333] mb-1">
                Safari Can&#39;t Open the Page
              </div>
              <div className="text-[12px] text-[#888] max-w-[320px]">
                Safari cannot open &#34;{extractDomain(activeTab?.url ?? "")}&#34; because
                the server where this page is located isn&#39;t responding, or the
                site doesn&#39;t allow framing.
              </div>
            </div>
            <button
              onClick={() => navigateTo(activeTab?.url ?? "")}
              className="mt-2 px-4 py-1.5 text-[12px] bg-[#0a84ff] text-white rounded-md hover:bg-[#0070e0] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : activeTab?.url ? (
          <>
            {/* Loading bar */}
            {activeTab.loading && (
              <div className="absolute top-0 left-0 right-0 h-[2px] z-10 bg-[#e0e0e0] overflow-hidden">
                <div className="h-full bg-[#0a84ff] animate-[safari-load_1.5s_ease-in-out_infinite] w-[40%]" />
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={activeTab.url}
              title={activeTab.title}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </>
        ) : (
          /* New Tab Page */
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-[#f8f8f8] to-[#eee]">
            <div className="text-[28px] font-light text-[#bbb] mb-8">Safari</div>
            <div className="grid grid-cols-4 gap-5">
              {BOOKMARKS.map((bm) => (
                <button
                  key={bm.label}
                  onClick={() => navigateTo(bm.url)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-[52px] h-[52px] rounded-xl bg-white shadow-sm border border-[#e0e0e0] flex items-center justify-center text-[18px] font-semibold text-[#0a84ff] group-hover:shadow-md transition-shadow">
                    {bm.label[0]}
                  </div>
                  <span className="text-[11px] text-[#666]">{bm.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
