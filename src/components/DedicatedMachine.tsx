import { dedicatedMachine } from "@/lib/content";

const caps = dedicatedMachine.capabilities;

// Radial geometry (viewBox units = % of the square stage).
const NODE_R = 41; // node-center radius
const LINE_IN = 15; // connector start radius (edge of the core glow)
const LINE_OUT = 34; // connector end radius (just before the pill)

const placed = caps.map((c, i) => {
  const a = ((-90 + i * (360 / caps.length)) * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    ...c,
    cx: 50 + NODE_R * cos,
    cy: 50 + NODE_R * sin,
    x1: 50 + LINE_IN * cos,
    y1: 50 + LINE_IN * sin,
    x2: 50 + LINE_OUT * cos,
    y2: 50 + LINE_OUT * sin,
  };
});

export function DedicatedMachine() {
  return (
    <div className="w-full">
      {/* ---------- Radial diagram (md and up) ---------- */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[640px] md:block">
        {/* Connectors */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <circle cx="50" cy="50" r={NODE_R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.2" />
          {placed.map((p, i) => (
            <g key={i}>
              <line
                x1={p.x1}
                y1={p.y1}
                x2={p.x2}
                y2={p.y2}
                stroke="rgba(245,169,60,0.45)"
                strokeWidth="0.35"
                strokeLinecap="round"
                className="wc-flow"
              />
              <circle cx={p.x2} cy={p.y2} r="0.7" fill="rgba(245,169,60,0.9)" />
            </g>
          ))}
        </svg>

        {/* Core glow */}
        <div className="wc-glow pointer-events-none absolute left-1/2 top-1/2 h-[44%] w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/30 blur-3xl" />

        {/* Mac mini */}
        <div className="absolute left-1/2 top-1/2 w-[34%] -translate-x-1/2 -translate-y-1/2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mac-mini.png"
            alt="A Mac mini — your dedicated automation machine"
            className="w-full select-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.55)]"
            draggable={false}
          />
        </div>

        {/* Nodes */}
        {placed.map((p, i) => (
          <div
            key={i}
            className="absolute flex w-[34%] max-w-[9.5rem] -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#0c0c10]/80 px-3 py-2 backdrop-blur-md"
            style={{ left: `${p.cx}%`, top: `${p.cy}%` }}
          >
            <span className="text-base leading-none" aria-hidden>
              {p.icon}
            </span>
            <span className="text-[11.5px] font-light leading-tight text-white/80">
              {p.label}
            </span>
          </div>
        ))}
      </div>

      {/* ---------- Stacked layout (mobile) ---------- */}
      <div className="md:hidden">
        <div className="relative mx-auto mb-8 w-44">
          <div className="wc-glow pointer-events-none absolute inset-0 -z-0 m-auto h-2/3 w-2/3 rounded-full bg-amber-400/30 blur-2xl" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mac-mini.png"
            alt="A Mac mini — your dedicated automation machine"
            className="relative w-full select-none drop-shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
            draggable={false}
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {caps.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5"
            >
              <span className="text-base leading-none" aria-hidden>
                {c.icon}
              </span>
              <span className="text-[12px] font-light leading-tight text-white/80">
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
