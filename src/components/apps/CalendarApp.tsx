"use client";

import { useState, useCallback, useMemo } from "react";
import { useDesktopStore } from "@/lib/store";
import type { WindowState } from "@/lib/types";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  color: string;
}

interface Props {
  window: WindowState;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CALENDAR_COLORS = [
  { name: "Home", color: "#5856D6" },
  { name: "Work", color: "#34C759" },
  { name: "Personal", color: "#FF9500" },
];

function dateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function CalendarApp({ window: win }: Props) {
  const { updateWindow } = useDesktopStore();

  const today = new Date();
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventColor, setNewEventColor] = useState(CALENDAR_COLORS[0].color);

  // Persist events via window data
  const events: CalendarEvent[] = useMemo(
    () => (win.data?.calendarEvents as CalendarEvent[] | undefined) ?? [],
    [win.data?.calendarEvents]
  );

  const setEvents = useCallback(
    (next: CalendarEvent[]) => {
      updateWindow(win.id, {
        data: { ...win.data, calendarEvents: next },
      });
    },
    [updateWindow, win.id, win.data]
  );

  // Navigation
  const goToPrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const goToToday = useCallback(() => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(todayKey);
  }, [today, todayKey]);

  // Build calendar grid
  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    const cells: { day: number; month: number; year: number; isCurrentMonth: boolean; key: string }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      cells.push({ day: d, month: prevMonth, year: prevYear, isCurrentMonth: false, key: dateKey(prevYear, prevMonth, d) });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true, key: dateKey(viewYear, viewMonth, d) });
    }

    // Next month leading days
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    const remaining = 42 - cells.length; // 6 rows
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, month: nextMonth, year: nextYear, isCurrentMonth: false, key: dateKey(nextYear, nextMonth, d) });
    }

    return cells;
  }, [viewYear, viewMonth]);

  // Events for selected date
  const selectedEvents = useMemo(
    () => events.filter((e) => e.date === selectedDate),
    [events, selectedDate]
  );

  // Events lookup for dots
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const arr = map.get(e.date);
      if (arr) arr.push(e);
      else map.set(e.date, [e]);
    }
    return map;
  }, [events]);

  const addEvent = useCallback(() => {
    if (!newEventTitle.trim() || !selectedDate) return;
    const event: CalendarEvent = {
      id: generateId(),
      title: newEventTitle.trim(),
      date: selectedDate,
      time: newEventTime || undefined,
      color: newEventColor,
    };
    setEvents([...events, event]);
    setNewEventTitle("");
    setNewEventTime("");
    setShowAddEvent(false);
  }, [newEventTitle, selectedDate, newEventTime, newEventColor, events, setEvents]);

  const deleteEvent = useCallback(
    (id: string) => {
      setEvents(events.filter((e) => e.id !== id));
    },
    [events, setEvents]
  );

  // Mini month for sidebar
  const miniGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length < 42) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  return (
    <div className="flex h-full bg-white text-[13px] text-gray-900 select-none">
      {/* Sidebar */}
      <div className="w-[200px] bg-[#f5f5f7] border-r border-gray-200 flex flex-col shrink-0">
        {/* Mini calendar */}
        <div className="px-3 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-500">
              {MONTHS[viewMonth]} {viewYear}
            </span>
          </div>
          <div className="grid grid-cols-7 gap-0">
            {DAYS.map((d) => (
              <div key={d} className="text-[9px] text-gray-400 text-center font-medium py-0.5">
                {d.charAt(0)}
              </div>
            ))}
            {miniGrid.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const key = dateKey(viewYear, viewMonth, day);
              const isToday = key === todayKey;
              const isSelected = key === selectedDate;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`text-[10px] w-5 h-5 mx-auto flex items-center justify-center rounded-full transition-colors ${
                    isToday
                      ? "bg-red-500 text-white font-bold"
                      : isSelected
                        ? "bg-blue-100 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-200 mx-3" />

        {/* Calendar list */}
        <div className="px-3 pt-3 flex-1">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            My Calendars
          </div>
          {CALENDAR_COLORS.map((cal) => (
            <div key={cal.name} className="flex items-center gap-2 py-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: cal.color }}
              />
              <span className="text-[12px] text-gray-700">{cal.name}</span>
            </div>
          ))}
        </div>

        {/* Selected date events */}
        <div className="border-t border-gray-200 mx-3" />
        <div className="px-3 py-3 max-h-[200px] overflow-y-auto">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Events
          </div>
          {selectedDate && selectedEvents.length > 0 ? (
            selectedEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-2 py-1 group"
              >
                <div
                  className="w-2 h-2 rounded-full mt-1 shrink-0"
                  style={{ backgroundColor: ev.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] text-gray-800 truncate">{ev.title}</div>
                  {ev.time && (
                    <div className="text-[10px] text-gray-400">{ev.time}</div>
                  )}
                </div>
                <button
                  onClick={() => deleteEvent(ev.id)}
                  className="text-[10px] text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <div className="text-[11px] text-gray-300">No events</div>
          )}
        </div>
      </div>

      {/* Main calendar area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-[44px] bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
          <button
            onClick={goToPrevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 text-[16px]"
          >
            ‹
          </button>
          <button
            onClick={goToNextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 text-[16px]"
          >
            ›
          </button>
          <h2 className="text-[18px] font-semibold text-gray-900 ml-1">
            {MONTHS[viewMonth]} {viewYear}
          </h2>
          <div className="flex-1" />
          <button
            onClick={goToToday}
            className="px-3 py-1 text-[12px] font-medium text-blue-500 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => {
              if (selectedDate) setShowAddEvent(true);
            }}
            className="px-3 py-1 text-[12px] font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
          >
            + Event
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-white shrink-0">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-[11px] font-semibold text-gray-400 text-center py-2 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 min-h-0">
          {calendarGrid.map((cell) => {
            const isToday = cell.key === todayKey;
            const isSelected = cell.key === selectedDate;
            const cellEvents = eventsByDate.get(cell.key);
            return (
              <button
                key={cell.key}
                onClick={() => setSelectedDate(cell.key)}
                className={`relative border-b border-r border-gray-100 p-1 text-left flex flex-col transition-colors overflow-hidden ${
                  cell.isCurrentMonth ? "bg-white" : "bg-gray-50/60"
                } ${isSelected && !isToday ? "bg-blue-50" : ""} hover:bg-blue-50/50`}
              >
                <div className="flex items-center justify-center mb-0.5">
                  <span
                    className={`w-6 h-6 flex items-center justify-center rounded-full text-[12px] leading-none ${
                      isToday
                        ? "bg-red-500 text-white font-bold"
                        : cell.isCurrentMonth
                          ? "text-gray-900"
                          : "text-gray-300"
                    } ${isSelected && !isToday ? "ring-2 ring-blue-400" : ""}`}
                  >
                    {cell.day}
                  </span>
                </div>
                {/* Event dots / labels */}
                {cellEvents && cellEvents.length > 0 && (
                  <div className="flex flex-col gap-px flex-1 min-h-0 overflow-hidden">
                    {cellEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className="text-[9px] leading-tight truncate rounded px-1 py-px text-white"
                        style={{ backgroundColor: ev.color }}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {cellEvents.length > 3 && (
                      <div className="text-[9px] text-gray-400 px-1">
                        +{cellEvents.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add event modal */}
      {showAddEvent && selectedDate && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[300px] p-4 border border-gray-200">
            <h3 className="text-[14px] font-semibold text-gray-900 mb-3">
              New Event
            </h3>
            <div className="text-[11px] text-gray-400 mb-3">{selectedDate}</div>
            <input
              autoFocus
              type="text"
              placeholder="Event title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addEvent();
                if (e.key === "Escape") setShowAddEvent(false);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-900 placeholder-gray-300 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 mb-2"
            />
            <input
              type="text"
              placeholder="Time (e.g. 2:00 PM)"
              value={newEventTime}
              onChange={(e) => setNewEventTime(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addEvent();
                if (e.key === "Escape") setShowAddEvent(false);
              }}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-900 placeholder-gray-300 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 mb-3"
            />
            {/* Color picker */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] text-gray-400">Calendar:</span>
              {CALENDAR_COLORS.map((cal) => (
                <button
                  key={cal.name}
                  onClick={() => setNewEventColor(cal.color)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    newEventColor === cal.color ? "border-gray-800 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: cal.color }}
                  title={cal.name}
                />
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAddEvent(false);
                  setNewEventTitle("");
                  setNewEventTime("");
                }}
                className="px-3 py-1.5 text-[12px] text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addEvent}
                disabled={!newEventTitle.trim()}
                className="px-3 py-1.5 text-[12px] text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
