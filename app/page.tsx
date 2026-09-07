import {
  ArrowRight,
  Bot,
  Clapperboard,
  MessageCircle,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";

import {
  AnimForgeLogo,
  PageBackground,
} from "@/components/animforge/ui";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      {/* NAVBAR */}

      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <div className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">

            <a
              href="/discover"
              className="transition hover:text-white"
            >
              Discover
            </a>

            <a
              href="/about"
              className="transition hover:text-white"
            >
              How It Works
            </a>

          </div>

          <div className="flex items-center gap-2">

            <a
              href="/auth/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.05]"
            >
              Log in
            </a>

            <a
              href="/auth/sign-up"
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
            >
              Join AnimForge
            </a>

          </div>

        </div>

      </nav>

      {/* HERO */}

      <section className="relative z-10 mx-auto max-w-[1400px] px-6 pb-28 pt-24 text-center md:pt-32">

        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">

          <Sparkles size={15} />

          Built for animation creators

        </div>

        <h1 className="mx-auto mt-8 max-w-5xl text-5xl font-black tracking-[-0.055em] md:text-7xl lg:text-8xl">

          Turn ideas into
          <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
            animation together.
          </span>

        </h1>

        <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-zinc-400 md:text-xl">
          AnimForge brings writers, animators,
          artists, voice actors and creative teams
          into one workspace to develop stories,
          build characters and produce animation.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">

          <a
            href="/auth/sign-up"
            className="flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 font-bold text-black transition hover:scale-[1.02]"
          >
            Start Creating

            <ArrowRight size={18} />
          </a>

          <a
            href="/discover"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 font-semibold text-zinc-200 transition hover:bg-white/[0.08]"
          >
            Explore Projects
          </a>

        </div>

        {/* WORKFLOW */}

        <div className="mt-24 grid gap-4 md:grid-cols-3">

          <FeatureCard
            icon={<WandSparkles size={23} />}
            title="Develop Ideas"
            text="Turn an initial idea into stories, characters, scenes and production plans."
          />

          <FeatureCard
            icon={<Users size={23} />}
            title="Build Your Team"
            text="Find animators, writers, artists, voice actors and other collaborators."
          />

          <FeatureCard
            icon={<Clapperboard size={23} />}
            title="Produce Together"
            text="Organize episodes, scenes, characters and production tasks in one project."
          />

        </div>

      </section>

      {/* AI */}

      <section className="relative z-10 mx-auto max-w-[1400px] px-6 pb-28">

        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.04] p-8 md:p-14">

          <div className="absolute right-[-120px] top-[-100px] h-[400px] w-[400px] rounded-full bg-violet-500/20 blur-[130px]" />

          <div className="relative grid gap-12 lg:grid-cols-2 lg:items-center">

            <div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-300">
                <Bot size={25} />
              </div>

              <h2 className="mt-7 text-4xl font-black tracking-[-0.04em] md:text-5xl">
                AI that assists the creator.
              </h2>

              <p className="mt-5 max-w-xl leading-8 text-zinc-400">
                Develop stories, explore character
                ideas, improve dialogue and maintain
                project continuity while keeping the
                human creator in control.
              </p>

            </div>

            <div className="space-y-3">

              {[
                "AI Story Studio",
                "Character development",
                "Project-aware continuity",
                "Editable creative drafts",
                "Local browser AI options",
              ].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/[0.07] bg-black/20 p-5 font-medium text-zinc-300"
                  >
                    ✦ {item}
                  </div>
                )
              )}

            </div>

          </div>

        </div>

      </section>

      {/* COLLABORATION */}

      <section className="relative z-10 mx-auto max-w-[1400px] px-6 pb-28">

        <div className="grid gap-5 lg:grid-cols-2">

          <FeatureLarge
            icon={<Users size={25} />}
            title="Find collaborators"
            text="Publish openings for the skills your production needs and bring accepted creators directly into the project."
          />

          <FeatureLarge
            icon={<MessageCircle size={25} />}
            title="Work as a team"
            text="Use project boards, production tasks, team chat and notifications to keep the animation moving."
          />

        </div>

      </section>

      {/* FINAL CTA */}

      <section className="relative z-10 mx-auto max-w-[1000px] px-6 pb-28 text-center">

        <h2 className="text-4xl font-black tracking-[-0.04em] md:text-6xl">
          Your animation can start with one idea.
        </h2>

        <p className="mx-auto mt-5 max-w-xl leading-7 text-zinc-500">
          Create the project. Find the people.
          Build the story. Produce it together.
        </p>

        <a
          href="/auth/sign-up"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-7 py-4 font-bold transition hover:bg-violet-400"
        >
          Create on AnimForge

          <ArrowRight size={18} />
        </a>

      </section>

      <PublicFooter />

    </main>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-7 text-left">

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
        {icon}
      </div>

      <h3 className="mt-6 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-zinc-500">
        {text}
      </p>

    </div>
  );
}

function FeatureLarge({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/[0.035] p-8 md:p-10">

      <div className="text-fuchsia-300">
        {icon}
      </div>

      <h3 className="mt-6 text-3xl font-black">
        {title}
      </h3>

      <p className="mt-4 max-w-xl leading-8 text-zinc-500">
        {text}
      </p>

    </div>
  );
}

function PublicFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06]">

      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">

        <div>
          <AnimForgeLogo />

          <p className="mt-3 text-sm text-zinc-600">
            Create. Collaborate. Animate.
          </p>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-zinc-500">

          <a href="/about">
            About
          </a>

          <a href="/privacy">
            Privacy
          </a>

          <a href="/terms">
            Terms
          </a>

          <a href="/auth/login">
            Login
          </a>

        </div>

      </div>

    </footer>
  );
}
