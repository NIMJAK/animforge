import {
  ArrowRight,
  BriefcaseBusiness,
  Clapperboard,
  Compass,
  FolderKanban,
  Palette,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#060608] text-white">

      {/* CINEMATIC BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute left-[-180px] top-[100px] h-[520px] w-[520px] rounded-full bg-violet-700/20 blur-[170px]" />

        <div className="absolute right-[-140px] top-[420px] h-[500px] w-[500px] rounded-full bg-fuchsia-700/10 blur-[160px]" />

        <div className="absolute bottom-[-220px] left-[35%] h-[520px] w-[520px] rounded-full bg-blue-700/10 blur-[160px]" />

      </div>

      {/* NAVBAR */}
      <nav className="relative z-30 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-6 py-5">

          {/* LOGO */}
          <a
            href="/"
            className="flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10">

              <WandSparkles
                size={19}
                className="text-violet-400"
              />

            </div>

            <div className="text-2xl font-black tracking-tight">
              Anim
              <span className="text-violet-500">
                Forge
              </span>
            </div>

          </a>

          {/* DESKTOP NAV */}
          <div className="hidden items-center gap-2 md:flex">

            <NavLink
              href="#discover"
              label="Discover"
            />

            <NavLink
              href="#collaborate"
              label="Collaborate"
            />

            <NavLink
              href="#how"
              label="How it works"
            />

          </div>

          {/* AUTH */}
          <div className="flex items-center gap-3">

            <a
              href="/auth/login"
              className="hidden rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white sm:block"
            >
              Log in
            </a>

            <a
              href="/auth/sign-up"
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Join AnimForge
            </a>

          </div>

        </div>

      </nav>

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-[1450px] px-6 pb-24 pt-16 md:pt-24">

        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-transparent px-7 py-16 shadow-2xl shadow-black/40 backdrop-blur-xl sm:px-12 md:py-24 lg:px-20">

          {/* HERO GLOWS */}
          <div className="absolute right-[-100px] top-[-100px] h-[450px] w-[450px] rounded-full bg-violet-500/20 blur-[130px]" />

          <div className="absolute bottom-[-200px] left-[20%] h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-[130px]" />

          <div className="relative grid gap-14 lg:grid-cols-[1.15fr_.85fr] lg:items-center">

            {/* LEFT */}
            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">

                <Sparkles size={15} />

                Built for animation creators

              </div>

              <h1 className="mt-8 max-w-5xl text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-8xl">

                Create worlds.

                <br />

                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  Together.
                </span>

              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400 md:text-xl">
                AnimForge is where storytellers,
                animators, artists, writers and voice
                actors come together to turn ideas
                into real animation projects.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">

                <a
                  href="/auth/sign-up"
                  className="group flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-black transition hover:scale-[1.02]"
                >
                  Start Creating

                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                </a>

                <a
                  href="/discover"
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 font-medium text-zinc-200 backdrop-blur transition hover:bg-white/[0.08]"
                >
                  <Compass size={18} />

                  Explore AnimForge
                </a>

              </div>

              {/* MINI STATS */}
              <div className="mt-12 flex flex-wrap gap-8">

                <MiniStat
                  value="Create"
                  label="Original projects"
                />

                <MiniStat
                  value="Connect"
                  label="With creators"
                />

                <MiniStat
                  value="Collaborate"
                  label="As a team"
                />

              </div>

            </div>

            {/* HERO VISUAL */}
            <div className="relative">

              <div className="absolute inset-0 rounded-full bg-violet-500/10 blur-[100px]" />

              <div className="relative rotate-[-2deg] rounded-[34px] border border-white/10 bg-black/30 p-5 shadow-2xl backdrop-blur-xl">

                <div className="rounded-[26px] border border-white/[0.08] bg-[#0d0d12] p-6">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-violet-400">
                        Featured World
                      </p>

                      <h3 className="mt-2 text-2xl font-bold">
                        The Last Sky
                      </h3>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">

                      <Clapperboard size={22} />

                    </div>

                  </div>

                  {/* ART AREA */}
                  <div className="relative mt-6 h-60 overflow-hidden rounded-[22px] border border-white/[0.06] bg-gradient-to-br from-violet-500/30 via-fuchsia-500/10 to-blue-500/10">

                    <div className="absolute left-[15%] top-[20%] h-28 w-28 rounded-full border border-white/10 bg-white/[0.04]" />

                    <div className="absolute bottom-[-30px] right-[8%] h-44 w-44 rounded-full border border-fuchsia-400/10 bg-fuchsia-500/10" />

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.18),transparent_30%)]" />

                    <div className="absolute bottom-5 left-5">

                      <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white backdrop-blur">
                        Fantasy • 2D Animation
                      </span>

                    </div>

                  </div>

                  <div className="mt-6">

                    <p className="text-sm text-zinc-500">
                      Looking for
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">

                      <RoleTag>
                        2D Animator
                      </RoleTag>

                      <RoleTag>
                        Background Artist
                      </RoleTag>

                      <RoleTag>
                        Voice Actor
                      </RoleTag>

                    </div>

                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-5">

                    <div className="flex items-center gap-2 text-sm text-zinc-400">

                      <Users size={16} />

                      4 creators collaborating

                    </div>

                    <span className="text-sm font-medium text-violet-400">
                      View Project →
                    </span>

                  </div>

                </div>

              </div>

              {/* FLOATING CARD */}
              <div className="absolute -bottom-8 -left-5 hidden rotate-[3deg] rounded-2xl border border-white/10 bg-[#111118]/90 p-4 shadow-2xl backdrop-blur-xl sm:block">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">

                    <Palette size={18} />

                  </div>

                  <div>
                    <p className="text-xs text-zinc-500">
                      New collaboration
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      Character Artist joined
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* CORE FEATURES */}
      <section
        id="discover"
        className="relative z-10 mx-auto max-w-[1450px] px-6 py-20"
      >

        <SectionHeader
          eyebrow="One creative universe"
          title="Everything you need to find your people."
          description="AnimForge connects different creative skills around one goal: making great animation."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          <FeatureCard
            icon={<Palette size={22} />}
            title="Show Your Work"
            text="Build a public creator profile and showcase artwork, designs and animation work."
          />

          <FeatureCard
            icon={<FolderKanban size={22} />}
            title="Create Projects"
            text="Turn your story or animation idea into a project others can discover."
          />

          <FeatureCard
            icon={<Users size={22} />}
            title="Build a Team"
            text="Find animators, writers, artists, voice actors and other creators."
          />

          <FeatureCard
            icon={<BriefcaseBusiness size={22} />}
            title="Find Opportunities"
            text="Apply to animation projects and become part of creative teams."
          />

        </div>

      </section>

      {/* COLLABORATION */}
      <section
        id="collaborate"
        className="relative z-10 mx-auto max-w-[1450px] px-6 py-20"
      >

        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.035] p-8 backdrop-blur-xl md:p-12">

          <div className="absolute right-[-90px] top-[-100px] h-[320px] w-[320px] rounded-full bg-fuchsia-500/10 blur-[110px]" />

          <div className="relative grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-center">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-400">
                Open Collaborations
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                Your idea doesn't
                need an entire studio.
              </h2>

              <p className="mt-6 max-w-lg leading-8 text-zinc-400">
                Start with what you have.
                AnimForge helps you find the
                skills you're missing.
              </p>

              <a
                href="/discover"
                className="group mt-8 inline-flex items-center gap-2 font-medium text-violet-400"
              >
                Find collaborations

                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              </a>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <CollaborationCard
                role="2D Animator"
                project="The Last Sky"
                style="Anime • Fantasy"
                type="Revenue Share"
              />

              <CollaborationCard
                role="Background Artist"
                project="Neon Kota"
                style="Sci-Fi • Cyberpunk"
                type="Collaboration"
              />

              <CollaborationCard
                role="Voice Actor"
                project="Fragments"
                style="Drama • Mystery"
                type="Remote"
              />

              <CollaborationCard
                role="Storyboard Artist"
                project="Moonbound"
                style="Adventure • 2D"
                type="Negotiable"
              />

            </div>

          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="relative z-10 mx-auto max-w-[1450px] px-6 py-24"
      >

        <SectionHeader
          eyebrow="The creative loop"
          title="From imagination to animation."
          description="AnimForge is designed around one simple journey."
          center
        />

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          <StepCard
            number="01"
            title="Create"
            text="Share your story, world or animation project."
          />

          <StepCard
            number="02"
            title="Connect"
            text="Find creators whose skills match what your project needs."
          />

          <StepCard
            number="03"
            title="Collaborate"
            text="Build your team, assign work and move production forward."
          />

          <StepCard
            number="04"
            title="Forge"
            text="Turn ideas, artwork and teamwork into something real."
          />

        </div>

      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-[1450px] px-6 pb-24 pt-12">

        <div className="relative overflow-hidden rounded-[40px] border border-violet-500/20 bg-gradient-to-br from-violet-500/15 via-fuchsia-500/[0.07] to-transparent px-7 py-16 text-center md:px-12 md:py-20">

          <div className="absolute left-[15%] top-[-120px] h-[350px] w-[350px] rounded-full bg-violet-500/20 blur-[130px]" />

          <div className="absolute bottom-[-160px] right-[10%] h-[350px] w-[350px] rounded-full bg-fuchsia-500/15 blur-[130px]" />

          <div className="relative">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-300">

              <WandSparkles size={25} />

            </div>

            <h2 className="mx-auto mt-7 max-w-4xl text-4xl font-black tracking-tight md:text-6xl">
              Your next world could
              start today.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
              Join AnimForge, find your creative
              team and start building the animation
              project you've been imagining.
            </p>

            <a
              href="/auth/sign-up"
              className="group mt-9 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 font-semibold text-black transition hover:scale-[1.02]"
            >
              Join AnimForge

              <ArrowRight
                size={18}
                className="transition group-hover:translate-x-1"
              />
            </a>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5">

        <div className="mx-auto flex max-w-[1450px] flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <WandSparkles size={17} />
            </div>

            <div className="font-bold">
              Anim
              <span className="text-violet-500">
                Forge
              </span>
            </div>

          </div>

          <p className="text-sm text-zinc-600">
            Create worlds together.
          </p>

          <p className="text-sm text-zinc-700">
            © 2026 AnimForge
          </p>

        </div>

      </footer>

    </main>
  );
}


/* COMPONENTS */

function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
    >
      {label}
    </a>
  );
}

function MiniStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>

      <p className="font-semibold text-zinc-200">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {label}
      </p>

    </div>
  );
}

function RoleTag({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300">
      {children}
    </span>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  center?: boolean;
}) {
  return (
    <div
      className={
        center
          ? "mx-auto max-w-3xl text-center"
          : "max-w-3xl"
      }
    >

      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
        {eyebrow}
      </p>

      <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
        {title}
      </h2>

      <p className="mt-5 text-lg leading-8 text-zinc-500">
        {description}
      </p>

    </div>
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
    <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-7 transition hover:-translate-y-1 hover:border-violet-500/30">

      <div className="absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
          {icon}
        </div>

        <h3 className="mt-6 text-xl font-semibold">
          {title}
        </h3>

        <p className="mt-3 leading-7 text-zinc-500">
          {text}
        </p>

      </div>

    </div>
  );
}

function CollaborationCard({
  role,
  project,
  style,
  type,
}: {
  role: string;
  project: string;
  style: string;
  type: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-6 transition hover:border-fuchsia-500/20 hover:bg-white/[0.025]">

      <div className="flex items-center justify-between">

        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
          Open
        </span>

        <Users
          size={17}
          className="text-zinc-600"
        />

      </div>

      <h3 className="mt-5 text-xl font-semibold">
        {role}
      </h3>

      <p className="mt-2 text-violet-400">
        {project}
      </p>

      <div className="mt-5 border-t border-white/[0.06] pt-4">

        <p className="text-sm text-zinc-500">
          {style}
        </p>

        <p className="mt-2 text-xs text-zinc-600">
          {type}
        </p>

      </div>

    </div>
  );
}

function StepCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025] p-7">

      <div className="text-5xl font-black text-white/[0.05]">
        {number}
      </div>

      <div className="mt-5 h-px w-12 bg-gradient-to-r from-violet-500 to-transparent" />

      <h3 className="mt-6 text-2xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-zinc-500">
        {text}
      </p>

    </div>
  );
}
