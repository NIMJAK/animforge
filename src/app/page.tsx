export default function Home() {
  return (
    <main className="min-h-screen bg-[#08080c] text-white">
      {/* Navbar */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-2xl font-bold tracking-tight">
          Anim<span className="text-violet-500">Forge</span>
        </div>

        <div className="hidden gap-8 text-sm text-zinc-400 md:flex">
          <a href="#discover" className="hover:text-white">
            Discover
          </a>
          <a href="#collaborate" className="hover:text-white">
            Collaborate
          </a>
          <a href="#how-it-works" className="hover:text-white">
            How it works
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-28 pt-24 text-center">
        <div className="mb-6 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
          Built for animation creators
        </div>

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          Create worlds{" "}
          <span className="text-violet-500">together.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          Where stories find artists, artists find teams, and animation ideas
          become real.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#how-it-works"
            className="rounded-xl bg-violet-600 px-7 py-3 font-medium transition hover:bg-violet-500"
          >
            Start Exploring
          </a>

          <a
            href="#collaborate"
            className="rounded-xl border border-zinc-700 px-7 py-3 font-medium text-zinc-200 transition hover:bg-zinc-900"
          >
            Find Collaborations
          </a>
        </div>
      </section>

      {/* Discover */}
      <section
        id="discover"
        className="border-t border-zinc-900 bg-[#0d0d12] px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
            Discover
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Find creators who can bring your idea to life.
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <FeatureCard
              title="Animators"
              description="Find 2D, 3D and motion artists looking for exciting projects."
            />

            <FeatureCard
              title="Writers"
              description="Connect with storytellers, scriptwriters and world-builders."
            />

            <FeatureCard
              title="Voice & Audio"
              description="Discover voice actors, composers and sound designers."
            />
          </div>
        </div>
      </section>

      {/* Collaboration */}
      <section id="collaborate" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
            Open Collaborations
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Great animation shouldn&apos;t require an entire studio.
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
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
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-zinc-900 bg-[#0d0d12] px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              How AnimForge Works
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              From idea to animation.
            </h2>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-4">
            <Step number="01" title="Create" text="Share your animation idea." />
            <Step number="02" title="Connect" text="Find the talent you need." />
            <Step number="03" title="Collaborate" text="Build together as a team." />
            <Step number="04" title="Publish" text="Show the world what you created." />
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-900 px-6 py-10 text-center text-sm text-zinc-500">
        © 2026 AnimForge — Create worlds together.
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#14141b] p-7 transition hover:border-violet-500/50">
      <div className="mb-5 h-11 w-11 rounded-xl bg-violet-500/15" />

      <h3 className="text-xl font-semibold">{title}</h3>

      <p className="mt-3 leading-7 text-zinc-400">{description}</p>
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
    <div className="rounded-2xl border border-zinc-800 bg-[#111118] p-7">
      <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
        Looking for
      </span>

      <h3 className="mt-5 text-2xl font-semibold">{role}</h3>

      <p className="mt-2 text-zinc-300">{project}</p>

      <div className="mt-5 flex gap-3 text-sm text-zinc-500">
        <span>{style}</span>
        <span>•</span>
        <span>{type}</span>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div>
      <span className="text-sm font-bold text-violet-500">{number}</span>
      <h3 className="mt-3 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-zinc-400">{text}</p>
    </div>
  );
}
