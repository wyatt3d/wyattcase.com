"use client";

import { useState, useEffect } from "react";

export default function MenuBar() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

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
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[25px] bg-[rgba(30,30,30,0.75)] backdrop-blur-2xl z-[9999] flex items-center px-4 text-[13px] text-white font-medium select-none border-b border-white/10">
      {/* Apple logo */}
      <button className="mr-4 text-[15px] hover:bg-white/10 px-2 py-0 rounded transition-colors">

      </button>

      {/* App name */}
      <span className="font-semibold mr-6">Finder</span>

      {/* Menu items */}
      <div className="flex gap-4 text-white/80">
        <span className="hover:bg-white/10 px-1.5 rounded cursor-default">File</span>
        <span className="hover:bg-white/10 px-1.5 rounded cursor-default">Edit</span>
        <span className="hover:bg-white/10 px-1.5 rounded cursor-default">View</span>
        <span className="hover:bg-white/10 px-1.5 rounded cursor-default">Go</span>
        <span className="hover:bg-white/10 px-1.5 rounded cursor-default">Window</span>
        <span className="hover:bg-white/10 px-1.5 rounded cursor-default">Help</span>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3 text-white/80">
        <span className="text-[14px]">🔋</span>
        <span className="text-[14px]">📶</span>
        <span>
          {date} {time}
        </span>
      </div>
    </div>
  );
}
