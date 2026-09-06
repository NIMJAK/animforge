import {
  ArrowRight,
  Sparkles,
  WandSparkles,
} from "lucide-react";

export function AnimForgeLogo() {
  return (
    <a href="/" className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10">
        <WandSparkles
          size={19}
          className="text-violet-400"
        />
      </div>

      <span className="text-2xl font-black tracking-tight">
        Anim
        <span className="text-violet-500">
          Forge
        </span>
      </span>
    </a>
  );
}

export function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-[-180px] top-[80px] h-[500px] w-[500px] rounded-full bg-violet-700/15 blur-[160px]" />

      <div className="absolute right-[-140px] top-[400px] h-[450px] w-[450px] rounded-full bg-fuchsia-700/10 blur-[150px]" />

      <div className="absolute bottom-[-220px] left-[35%] h-[500px] w-[500px] rounded-full bg-blue-700/10 blur-[160px]" />
    </div>
  );
}

export function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-white/[0.035] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
          {eyebrow}
        </p>
      )}

      <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
        {title}
      </h1>

      {description && (
        <p className="mt-4 max-w-2xl leading-7 text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}

export function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-black transition hover:scale-[1.02]"
    >
      {children}

      <ArrowRight
        size={16}
        className="transition group-hover:translate-x-1"
      />
    </a>
  );
}

export function VioletButton({
  children,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-medium text-zinc-200 transition hover:bg-white/[0.08]"
    >
      {children}
    </a>
  );
}

export function CreativeBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300">
      <Sparkles size={13} />
      {children}
    </span>
  );
}

export const inputStyle =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/50 focus:bg-white/[0.03]";

export const selectStyle =
  "w-full rounded-2xl border border-white/10 bg-[#0b0b10] px-4 py-3 text-white outline-none focus:border-violet-500/50";
