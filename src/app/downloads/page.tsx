import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fleet setup",
  description: "Provision a new Mac into the wyattcase.com admin.",
  robots: { index: false, follow: false },
};

const steps = [
  "In admin → Fleet, add the device (or open an existing one) and click “Download installer for this Mac.” The device token and Screen Sharing password are already baked in — nothing to paste.",
  "On the new Mac, right-click the downloaded file → Open (first time only, to get past macOS’s unsigned-app warning), then enter the Mac’s login password if it asks.",
  "It appears green in admin → Fleet within ~60s. Open remote desktop and sign into Claude once — you’re done.",
];

export default function DownloadsPage() {
  return (
    <main className="relative z-10 mx-auto max-w-3xl px-6 pb-28 pt-32 sm:px-10">
      <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber-300/80">Fleet setup</div>
      <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-white sm:text-4xl">
        One file. A fully-enrolled Mac.
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] font-light leading-relaxed text-white/70">
        Get your installer from{" "}
        <a
          href="https://admin.wyattcase.com/fleet"
          className="text-amber-300/90 underline decoration-amber-300/30 underline-offset-4 transition-colors hover:text-amber-200"
        >
          admin → Fleet
        </a>{" "}
        → open the device → “Download installer for this Mac.” It comes with the device token and Screen Sharing
        password already baked in — nothing to paste. Run it once and the Mac enrolls itself: joins Tailscale,
        installs Claude Code + tmux + the voice stack, trusts the hub’s SSH key, turns on in-browser remote desktop,
        and starts health reporting.
      </p>

      <a
        href="https://admin.wyattcase.com/fleet"
        className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5"
      >
        Get your installer · admin → Fleet ↗
      </a>

      <ol className="mt-12 space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 font-mono text-[12px] text-amber-300/80">
              {i + 1}
            </span>
            <p className="text-[14.5px] font-light leading-relaxed text-white/75">{s}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-[13px] font-light leading-relaxed text-white/60">
        <p>
          What it does: joins Tailscale, installs Claude Code + tmux and the voice stack so you can drive the Mac
          from the hub by voice, trusts the hub’s SSH key, enables in-browser remote desktop, and reports health —
          all in a single run. No cloning, no config files.
        </p>
        <p className="mt-3">
          Advanced / manual: prefer to type a token yourself? Grab the fallback provisioner at{" "}
          <a
            href="/provision-mac.command"
            download
            className="text-white/80 underline decoration-white/20 underline-offset-4 hover:text-white"
          >
            /provision-mac.command
          </a>{" "}
          and paste the device token when it prompts.
        </p>
        <p className="mt-3">
          Internal tool. If the remote screen is blank after setup, enable System Settings → General → Sharing →
          Screen Sharing on the Mac.
        </p>
      </div>
    </main>
  );
}
