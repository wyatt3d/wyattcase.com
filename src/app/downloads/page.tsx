import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fleet setup",
  description: "Provision a new Mac into the wyattcase.com admin.",
  robots: { index: false, follow: false },
};

const steps = [
  "In admin → Fleet → Add device, then copy the device token it shows (once).",
  "On the Mac, run the downloaded file (right-click → Open the first time). Paste the token and set a Screen Sharing password — it enrolls itself and joins Tailscale automatically.",
  "The Mac appears in admin → Fleet within ~60s. Use “Open remote desktop” to control it in-browser.",
];

export default function DownloadsPage() {
  return (
    <main className="relative z-10 mx-auto max-w-3xl px-6 pb-28 pt-32 sm:px-10">
      <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber-300/80">Fleet setup</div>
      <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight text-white sm:text-4xl">
        One file. A fully-enrolled Mac.
      </h1>
      <p className="mt-5 max-w-2xl text-[15px] font-light leading-relaxed text-white/70">
        The provisioner enrolls a new Mac into your admin panel in a single run — joins Tailscale, starts
        health reporting, and turns on in-browser remote desktop. No cloning, no config files.
      </p>

      <a
        href="/provision-mac.command"
        download
        className="mt-9 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5"
      >
        Download provisioner · macOS ↓
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
          Prefer the terminal? <code className="rounded bg-white/10 px-1.5 py-0.5 text-white/80">bash ~/Downloads/provision-mac.command</code>
        </p>
        <p className="mt-2">
          Internal tool. If the remote screen is blank after setup, enable System Settings → General → Sharing →
          Screen Sharing on the Mac.
        </p>
      </div>
    </main>
  );
}
