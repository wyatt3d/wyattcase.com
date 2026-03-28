"use client";

import { useEffect, useCallback, useState } from "react";
import { useDesktopStore } from "@/lib/store";
import type { DesktopItem } from "@/lib/types";
import MenuBar from "./MenuBar";
import Dock from "./Dock";
import ContextMenu from "./ContextMenu";
import DesktopIcon from "./DesktopIcon";
import Window from "./Window";
import BootScreen from "./BootScreen";
import Spotlight from "./Spotlight";
import NotificationCenter from "./NotificationCenter";
import Launchpad from "./Launchpad";
import FinderApp from "./apps/FinderApp";
import TextEditApp from "./apps/TextEditApp";
import TerminalApp from "./apps/TerminalApp";
import SafariApp from "./apps/SafariApp";
import CalculatorApp from "./apps/CalculatorApp";
import CalendarApp from "./apps/CalendarApp";
import NotesApp from "./apps/NotesApp";
import SettingsApp from "./apps/SettingsApp";
import PhotosApp from "./apps/PhotosApp";
import MusicApp from "./apps/MusicApp";
import WeatherApp from "./apps/WeatherApp";
import MapsApp from "./apps/MapsApp";
import AppStoreApp from "./apps/AppStoreApp";
import MailApp from "./apps/MailApp";

// App window defaults
const APP_CONFIGS: Record<string, { title: string; width: number; height: number; data?: Record<string, unknown> }> = {
  finder: { title: "Finder", width: 800, height: 500, data: { folderId: null } },
  safari: { title: "Safari", width: 900, height: 600, data: { url: "https://wyattcase.com" } },
  calculator: { title: "Calculator", width: 260, height: 400 },
  calendar: { title: "Calendar", width: 750, height: 520 },
  notes: { title: "Notes", width: 700, height: 500 },
  photos: { title: "Photos", width: 800, height: 550 },
  music: { title: "Music", width: 800, height: 520 },
  textedit: { title: "Untitled", width: 600, height: 400, data: { content: "", fileId: null } },
  terminal: { title: "Terminal", width: 640, height: 400 },
  settings: { title: "System Settings", width: 780, height: 520 },
  weather: { title: "Weather", width: 600, height: 550 },
  maps: { title: "Maps", width: 800, height: 550 },
  appstore: { title: "App Store", width: 850, height: 560 },
  mail: { title: "Mail", width: 900, height: 560 },
};

function renderApp(appId: string, win: import("@/lib/types").WindowState) {
  switch (appId) {
    case "finder": return <FinderApp window={win} />;
    case "textedit": return <TextEditApp window={win} />;
    case "terminal": return <TerminalApp window={win} />;
    case "safari": return <SafariApp window={win} />;
    case "calculator": return <CalculatorApp window={win} />;
    case "calendar": return <CalendarApp window={win} />;
    case "notes": return <NotesApp window={win} />;
    case "settings": return <SettingsApp window={win} />;
    case "photos": return <PhotosApp window={win} />;
    case "music": return <MusicApp window={win} />;
    case "weather": return <WeatherApp window={win} />;
    case "maps": return <MapsApp window={win} />;
    case "appstore": return <AppStoreApp window={win} />;
    case "mail": return <MailApp window={win} />;
    default:
      return (
        <div className="h-full bg-[#1e1e1e] flex items-center justify-center text-white/40 text-sm">
          {appId} — Coming soon
        </div>
      );
  }
}

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
    focusWindow,
    setSelectedItemId,
    setEditingItemId,
    clearSelection,
  } = useDesktopStore();

  const [booted, setBooted] = useState(false);
  const [spotlightVisible, setSpotlightVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [launchpadVisible, setLaunchpadVisible] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const desktopItems = items.filter((i) => i.parentId === null);

  // Open an app by ID
  const openApp = useCallback(
    (appId: string) => {
      // Check for existing window
      const existing = windows.find((w) => w.appId === appId && !w.minimized);
      if (existing) {
        focusWindow(existing.id);
        return;
      }
      const minimized = windows.find((w) => w.appId === appId && w.minimized);
      if (minimized) {
        focusWindow(minimized.id);
        return;
      }

      const config = APP_CONFIGS[appId];
      if (!config) return;

      const centerX = Math.max(100, (window.innerWidth - config.width) / 2) + Math.random() * 40;
      const centerY = Math.max(50, (window.innerHeight - config.height) / 2) + Math.random() * 30;

      openWindow({
        appId,
        title: config.title,
        x: centerX,
        y: centerY,
        width: config.width,
        height: config.height,
        minimized: false,
        maximized: false,
        data: config.data,
      });
    },
    [windows, focusWindow, openWindow]
  );

  // Open desktop item
  const openItem = useCallback(
    (itemId: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      handleItemOpen(item);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items]
  );

  // Cmd+Space for Spotlight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === " ") {
        e.preventDefault();
        setSpotlightVisible((v) => !v);
      }
      if (e.key === "F4" || ((e.metaKey || e.ctrlKey) && e.key === "l")) {
        // Launchpad shortcut
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
                "linear-gradient(135deg, #232526 0%, #414345 100%)",
                "linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)",
              ];
              const el = document.getElementById("desktop-bg");
              const current = el?.style.background || "";
              const idx = colors.indexOf(current);
              const next = colors[(idx + 1) % colors.length];
              if (el) el.style.background = next;
              try { localStorage.setItem("wyattcase-wallpaper", next); } catch {}
            },
          },
          { label: "", action: () => {}, separator: true },
          {
            label: "Sort by Name",
            action: () => {
              const sorted = [...desktopItems].sort((a, b) => a.name.localeCompare(b.name));
              const { updateItem } = useDesktopStore.getState();
              sorted.forEach((item, i) => {
                updateItem(item.id, { x: 80, y: 60 + i * 110 });
              });
            },
          },
          {
            label: "Sort by Kind",
            action: () => {
              const sorted = [...desktopItems].sort((a, b) => {
                if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
                return a.name.localeCompare(b.name);
              });
              const { updateItem } = useDesktopStore.getState();
              sorted.forEach((item, i) => {
                updateItem(item.id, { x: 80, y: 60 + i * 110 });
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
        clearSelection();
        hideContextMenu();
      }
    },
    [setSelectedItemId, clearSelection, hideContextMenu]
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

  // Load wallpaper from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wyattcase-wallpaper");
      if (saved) {
        const el = document.getElementById("desktop-bg");
        if (el) el.style.background = saved;
      }
    } catch {}
  }, [hydrated]);

  // Compute active window (topmost z-index)
  const topZ = windows.reduce(
    (max, w) => (!w.minimized && w.zIndex > max ? w.zIndex : max),
    0
  );

  if (!hydrated) {
    return <div className="h-screen w-screen bg-black" />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden select-none">
      {/* Boot screen */}
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}

      {/* Wallpaper */}
      <div
        id="desktop-bg"
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      />

      <MenuBar
        onOpenSettings={() => openApp("settings")}
        onOpenAbout={() => openApp("settings")}
        onToggleNotifications={() => setNotificationsVisible((v) => !v)}
      />

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
        <Window key={win.id} window={win} isActive={!win.minimized && win.zIndex === topZ}>
          {renderApp(win.appId, win)}
        </Window>
      ))}

      <Dock onOpenApp={openApp} />
      <ContextMenu />

      {/* Overlays */}
      <Spotlight
        visible={spotlightVisible}
        onClose={() => setSpotlightVisible(false)}
        onOpenApp={(appId) => {
          openApp(appId);
          setSpotlightVisible(false);
        }}
        onOpenItem={(itemId) => {
          openItem(itemId);
          setSpotlightVisible(false);
        }}
      />

      <NotificationCenter
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />

      <Launchpad
        visible={launchpadVisible}
        onClose={() => setLaunchpadVisible(false)}
        onOpenApp={(appId) => {
          openApp(appId);
          setLaunchpadVisible(false);
        }}
      />
    </div>
  );
}
