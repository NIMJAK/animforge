import {
  ArrowLeft,
  Bot,
  Clapperboard,
  Lightbulb,
  Users,
} from "lucide-react";

import {
  AnimForgeLogo,
  PageBackground,
} from "@/components/animforge/ui";

export default function AboutPage() {
  const steps = [
    {
      icon: <Lightbulb size={22} />,
      title: "1. Start with an idea",
      text: "Create a project yourself or use AnimForge AI to develop an initial animation blueprint.",
    },
    {
      icon: <Users size={22} />,
      title: "2. Build the team",
      text: "Create project openings and connect with writers, animators, artists, voice actors and other creators.",
    },
    {
      icon: <Bot size={22} />,
      title: "3. Develop the world",
      text: "Build stories and characters while keeping saved project context and continuity available to the creative workflow.",
    },
    {
      icon: <Clapperboard size={22} />,
      title: "4. Produce the animation",
      text: "Organize episodes and scenes, attach characters and turn scenes into storyboard, animation, voice, sound and editing tasks.",
    },
  ];

  return (
    <main className="relative min-h-screen bg-[#060608] text-white">

      <PageBackground />

      <nav className="relative z-20 border-b border-white/5">

        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <a
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-400"
          >
            <ArrowLeft size={16} />
            Home
          </a>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[1100px] px-6 py-20">

        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
          About AnimForge
        </p>

        <h1 className="mt-5 max-w-4xl text-5xl font-black tracking-[-0.05em] md:text-7xl">
          A workspace built around how animation gets made.
        </h1>

        <p className="mt-8 max-w-3xl text-lg leading-8 text-zinc-400">
          AnimForge is a creative collaboration
          platform for animators, writers, character
          artists, storyboard artists, voice actors,
          editors, sound creators and animation teams.
        </p>

        <div className="mt-20 grid gap-5 md:grid-cols-2">

          {steps.map(
            (step) => (
              <div
                key={step.title}
                className="rounded-[30px] border border-white/10 bg-white/[0.035] p-8"
              >
                <div className="text-violet-300">
                  {step.icon}
                </div>

                <h2 className="mt-5 text-2xl font-black">
                  {step.title}
                </h2>

                <p className="mt-3 leading-7 text-zinc-500">
                  {step.text}
                </p>
              </div>
            )
          )}

        </div>

        <div className="mt-20 rounded-[34px] border border-violet-500/20 bg-violet-500/[0.06] p-8 md:p-10">

          <h2 className="text-3xl font-black">
            AI assists. Creators decide.
          </h2>

          <p className="mt-4 max-w-3xl leading-8 text-zinc-400">
            AnimForge AI is designed to help creators
            explore, refine and organize creative work.
            Generated material remains editable and the
            creator remains responsible for the final
            creative decisions.
          </p>

        </div>

      </section>

    </main>
  );
}
