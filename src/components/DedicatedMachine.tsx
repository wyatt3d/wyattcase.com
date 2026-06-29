import { dedicatedMachine } from "@/lib/content";

const caps = dedicatedMachine.capabilities;

// Lightweight static showcase: the owned machine + what it runs.
// No canvas, no animation, no per-frame work.
export function DedicatedMachine() {
  return (
    <div className="w-full">
      <div className="relative mx-auto mb-10 w-44 sm:w-56">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-0 m-auto h-2/3 w-2/3 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,169,60,0.22), transparent 70%)" }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mac-mini.png"
          alt="A Mac mini — your dedicated automation machine"
          className="relative w-full select-none drop-shadow-[0_18px_45px_rgba(0,0,0,0.5)]"
          draggable={false}
        />
      </div>

      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-2.5 sm:grid-cols-4">
        {caps.map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
          >
            <span className="text-base leading-none" aria-hidden>
              {c.icon}
            </span>
            <span className="text-[12px] font-light leading-tight text-white/80">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
