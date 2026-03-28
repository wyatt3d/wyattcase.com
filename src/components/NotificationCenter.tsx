"use client";

import { useState, useEffect, useCallback } from "react";

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  app: string;
  icon: string;
  title: string;
  body: string;
  timestamp: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    app: "System Preferences",
    icon: "⚙️",
    title: "Welcome to macOS",
    body: "Your Mac is set up and ready to go. Explore new features in System Preferences.",
    timestamp: "now",
  },
  {
    id: "2",
    app: "Tips",
    icon: "💡",
    title: "Quick Tip",
    body: "Use Spotlight Search (Cmd + Space) to quickly find files, apps, and more.",
    timestamp: "2m ago",
  },
  {
    id: "3",
    app: "App Store",
    icon: "🛍️",
    title: "Updates Available",
    body: "3 app updates are available. Open the App Store to update.",
    timestamp: "15m ago",
  },
  {
    id: "4",
    app: "Calendar",
    icon: "📅",
    title: "Upcoming Event",
    body: "Team standup in 30 minutes.",
    timestamp: "28m ago",
  },
  {
    id: "5",
    app: "Mail",
    icon: "✉️",
    title: "New Message",
    body: "You have 2 unread emails in your inbox.",
    timestamp: "1h ago",
  },
];

function DigitalClock() {
  const [time, setTime] = useState<string>("");
  const [seconds, setSeconds] = useState<string>("");

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
      setSeconds(now.getSeconds().toString().padStart(2, "0"));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-light text-white tracking-tight">
        {time}
      </span>
      <span className="text-sm text-white/50">{seconds}s</span>
    </div>
  );
}

function MiniCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="mt-2">
      <div className="grid grid-cols-7 gap-0.5 text-[10px] text-white/40 mb-1">
        {dayLabels.map((d) => (
          <div key={d} className="text-center font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-[10px]">
        {cells.map((day, i) => (
          <div
            key={i}
            className={`text-center h-5 flex items-center justify-center rounded-full ${
              day === today
                ? "bg-blue-500 text-white font-semibold"
                : day
                  ? "text-white/70"
                  : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NotificationCenter({
  visible,
  onClose,
}: NotificationCenterProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [dateStr, setDateStr] = useState({ day: "", fullDate: "" });

  useEffect(() => {
    const now = new Date();
    setDateStr({
      day: now.toLocaleDateString("en-US", { weekday: "long" }),
      fullDate: now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      }),
    });
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <>
      {/* Backdrop - click to close */}
      {visible && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={`fixed top-[25px] right-0 bottom-0 w-[360px] z-[9999] transition-transform duration-300 ease-in-out ${
          visible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full bg-[rgba(30,30,30,0.72)] backdrop-blur-2xl border-l border-white/10 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
          <div className="p-5">
            {/* Date Header */}
            <div className="mb-5">
              <p className="text-sm font-medium text-white/50 uppercase tracking-wide">
                {dateStr.day}
              </p>
              <p className="text-2xl font-semibold text-white">
                {dateStr.fullDate}
              </p>
            </div>

            {/* Widgets Section */}
            <div className="space-y-3 mb-6">
              {/* Weather Widget */}
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 font-medium uppercase tracking-wide">
                      Weather
                    </p>
                    <p className="text-3xl font-light text-white mt-1">72°F</p>
                    <p className="text-sm text-white/70">Sunny</p>
                    <p className="text-xs text-white/40 mt-1">
                      Cupertino, CA &middot; H:78° L:62°
                    </p>
                  </div>
                  <div className="text-5xl">☀️</div>
                </div>
              </div>

              {/* Clock + Calendar row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Clock Widget */}
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-white/50 font-medium uppercase tracking-wide mb-2">
                    Clock
                  </p>
                  <DigitalClock />
                </div>

                {/* Battery Widget */}
                <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                  <p className="text-xs text-white/50 font-medium uppercase tracking-wide mb-2">
                    Battery
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl">🔋</span>
                    <div>
                      <p className="text-2xl font-light text-white">87%</p>
                      <p className="text-[10px] text-green-400">Charging</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar Widget */}
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-white/50 font-medium uppercase tracking-wide">
                    Calendar
                  </p>
                  <span className="text-sm">📅</span>
                </div>
                <p className="text-sm font-medium text-white">
                  {dateStr.day}, {dateStr.fullDate}
                </p>
                <MiniCalendar />
              </div>

              {/* Screen Time Widget */}
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-xs text-white/50 font-medium uppercase tracking-wide mb-3">
                  Screen Time
                </p>
                <p className="text-2xl font-light text-white">4h 23m</p>
                <p className="text-xs text-white/40 mt-1">
                  Daily average &middot; 12% less than last week
                </p>
                {/* Mini bar chart */}
                <div className="flex items-end gap-1 mt-3 h-10">
                  {[40, 65, 55, 80, 45, 70, 50].map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${
                        i === 6 ? "bg-blue-400" : "bg-blue-400/40"
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-white/30">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span className="text-white/60">Sun</span>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-white">
                  Notifications
                </p>
                {notifications.length > 0 && (
                  <button
                    onClick={() => setNotifications([])}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm">No Notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="group bg-white/10 rounded-xl p-3 backdrop-blur-sm relative transition-all hover:bg-white/15"
                    >
                      <button
                        onClick={() => dismissNotification(n.id)}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/10 text-white/40 hover:bg-white/25 hover:text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Dismiss notification from ${n.app}`}
                      >
                        ×
                      </button>
                      <div className="flex gap-3">
                        <div className="text-xl flex-shrink-0 mt-0.5">
                          {n.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                              {n.app}
                            </p>
                            <span className="text-[10px] text-white/30 ml-auto mr-5">
                              {n.timestamp}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-white mt-0.5">
                            {n.title}
                          </p>
                          <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                            {n.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
