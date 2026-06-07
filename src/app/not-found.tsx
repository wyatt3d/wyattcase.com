import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative z-10 flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-amber-300/70">
        404
      </div>
      <h1 className="mt-4 text-4xl font-light tracking-tight text-white sm:text-5xl">
        Nothing here.
      </h1>
      <p className="mt-4 max-w-md text-[15px] font-light leading-relaxed text-white/65">
        That page doesn&apos;t exist — but the work that does is worth a look.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5"
      >
        Back home
      </Link>
    </main>
  );
}
