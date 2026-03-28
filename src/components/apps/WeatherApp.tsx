"use client";

import type { WindowState } from "@/lib/types";

interface Props {
  window: WindowState;
}

const HOURLY_FORECAST = [
  { hour: "Now", temp: 72, icon: "☀️" },
  { hour: "1PM", temp: 73, icon: "☀️" },
  { hour: "2PM", temp: 74, icon: "🌤️" },
  { hour: "3PM", temp: 74, icon: "🌤️" },
  { hour: "4PM", temp: 73, icon: "🌤️" },
  { hour: "5PM", temp: 71, icon: "⛅" },
  { hour: "6PM", temp: 69, icon: "⛅" },
  { hour: "7PM", temp: 66, icon: "🌅" },
  { hour: "8PM", temp: 63, icon: "🌙" },
  { hour: "9PM", temp: 61, icon: "🌙" },
  { hour: "10PM", temp: 59, icon: "🌙" },
  { hour: "11PM", temp: 58, icon: "🌙" },
];

const DAILY_FORECAST = [
  { day: "Today", icon: "☀️", high: 75, low: 58 },
  { day: "Sat", icon: "🌤️", high: 73, low: 57 },
  { day: "Sun", icon: "⛅", high: 68, low: 55 },
  { day: "Mon", icon: "🌧️", high: 62, low: 52 },
  { day: "Tue", icon: "🌦️", high: 65, low: 54 },
];

const DETAILS = [
  { label: "Feels Like", value: "70°" },
  { label: "Humidity", value: "62%" },
  { label: "Wind", value: "12 mph" },
  { label: "UV Index", value: "5 Moderate" },
  { label: "Visibility", value: "10 mi" },
  { label: "Pressure", value: "29.92 in" },
];

function tempBarPosition(low: number, high: number, dayLow: number, dayHigh: number) {
  const range = 80 - 50; // global range for the week
  const leftPct = ((dayLow - 50) / range) * 100;
  const widthPct = ((dayHigh - dayLow) / range) * 100;
  return { left: `${leftPct}%`, width: `${Math.max(widthPct, 8)}%` };
}

export default function WeatherApp({ window: win }: Props) {
  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-b from-[#1a3a5c] via-[#2563a8] to-[#4a90d9] text-white selection:bg-white/20">
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
        {/* Current conditions */}
        <div className="flex flex-col items-center pt-2 pb-4">
          <p className="text-sm font-medium tracking-wide text-white/80">San Francisco</p>
          <p className="text-8xl font-extralight leading-none tracking-tighter">72°</p>
          <p className="mt-1 text-lg font-medium text-white/90">Sunny</p>
          <p className="text-sm text-white/60">H:75°  L:58°</p>
        </div>

        {/* Hourly forecast */}
        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
          <p className="mb-3 text-xs font-medium tracking-wide text-white/50 uppercase">
            Hourly Forecast
          </p>
          <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {HOURLY_FORECAST.map((h) => (
              <div key={h.hour} className="flex flex-col items-center gap-1.5" style={{ minWidth: 44 }}>
                <span className="text-xs font-medium text-white/70">{h.hour}</span>
                <span className="text-xl leading-none">{h.icon}</span>
                <span className="text-sm font-semibold">{h.temp}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5-day forecast */}
        <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
          <p className="mb-3 text-xs font-medium tracking-wide text-white/50 uppercase">
            5-Day Forecast
          </p>
          <div className="flex flex-col divide-y divide-white/10">
            {DAILY_FORECAST.map((d) => {
              const bar = tempBarPosition(58, 75, d.low, d.high);
              return (
                <div key={d.day} className="flex items-center gap-2 py-2">
                  <span className="w-10 text-sm font-medium text-white/80">{d.day}</span>
                  <span className="w-6 text-center text-base">{d.icon}</span>
                  <span className="w-8 text-right text-sm text-white/50">{d.low}°</span>
                  <div className="relative mx-2 h-1 flex-1 rounded-full bg-white/15">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-sky-300 to-amber-300"
                      style={bar}
                    />
                  </div>
                  <span className="w-8 text-sm font-medium">{d.high}°</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3">
          {DETAILS.map((d) => (
            <div
              key={d.label}
              className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-md"
            >
              <p className="text-xs font-medium tracking-wide text-white/50 uppercase">
                {d.label}
              </p>
              <p className="mt-1 text-xl font-semibold">{d.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
