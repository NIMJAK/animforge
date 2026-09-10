"use client";

import Link from "next/link";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Clapperboard,
  FolderKanban,
  Plus,
  Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  AnimForgeLogo,
  PageBackground,
} from "@/components/animforge/ui";

type Project = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  genre: string | null;
  animation_style: string | null;
  status: string;
  visibility: string;
  created_at: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProjects() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          slug,
          description,
          genre,
          animation_style,
          status,
          visibility,
          created_at
        `)
        .eq("visibility", "public")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(error);
        setMessage("Could not load projects.");
      } else {
        setProjects(data || []);
      }

      setLoading(false);
    }

    loadProjects();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">
      <PageBackground />

      {/* NAVBAR */}
      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-6 py-5">
          <AnimForgeLogo />

          <div className="flex items-center gap-2">
            <a
              href="/dashboard"
              className="rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              Dashboard
            </a>

            <a
              href="/discover"
              className="hidden rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white sm:block"
            >
              Discover
            </a>

            <Link
              href="/projects/new"
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              <Plus size={16} />
              Create
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-[1450px] px-6 pb-24 pt-14">

        {/* HERO */}
        <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl md:p-12">
          <div className="absolute right-[-130px] top-[-140px] h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-[140px]" />

          <div className="absolute bottom-[-180px] left-[25%] h-[350px] w-[350px] rounded-full bg-fuchsia-500/10 blur-[130px]" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_.6fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
                <FolderKanban size={15} />
                Animation Worlds
              </div>

              <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1] tracking-[-0.04em] md:text-6xl">
                Worlds waiting
                <br />

                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  to be forged.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
                Explore original animation projects,
                discover new stories and find teams
                looking for creative talent.
              </p>
            </div>

            <div className="flex lg:justify-end">
              <Link
                href="/projects/new"
                className="group flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-black transition hover:scale-[1.02]"
              >
                <Plus size={18} />
                Start a New World

                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* PROJECT COUNT */}
        {!loading && (
          <div className="mt-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
                Community Projects
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Explore the Forge
              </h2>
            </div>

            <p className="text-sm text-zinc-600">
              {projects.length}{" "}
              {projects.length === 1
                ? "project"
                : "projects"}
            </p>
          </div>
        )}

        {message && (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {message}
          </div>
        )}

        {loading ? (
          <div className="py-32 text-center">
            <Sparkles
              size={28}
              className="mx-auto text-violet-400"
            />

            <p className="mt-4 text-zinc-500">
              Discovering new worlds...
            </p>
          </div>
        ) : projects.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-[32px] border border-dashed border-white/10 bg-white/[0.02] p-14 text-center">
            <Clapperboard
              size={30}
              className="mx-auto text-violet-500"
            />

            <h3 className="mt-5 text-2xl font-semibold">
              The forge is empty.
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-zinc-500">
              Be the first creator to start an
              animation project.
            </p>

            <Link
              href="/projects/new"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-medium transition hover:bg-violet-500"
            >
              <Plus size={16} />
              Create Project
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const gradients = [
    "from-violet-500/30 via-fuchsia-500/10 to-blue-500/5",
    "from-blue-500/25 via-cyan-500/10 to-violet-500/5",
    "from-fuchsia-500/25 via-pink-500/10 to-orange-500/5",
    "from-emerald-500/20 via-cyan-500/10 to-blue-500/5",
  ];

  const gradient =
    gradients[index % gradients.length];

  return (
    <a
      href={`/projects/${project.slug}`}
      className="group overflow-hidden rounded-[30px] border border-white/10 bg-[#0d0d12] transition duration-300 hover:-translate-y-1 hover:border-violet-500/30"
    >
      {/* ART PANEL */}
      <div
        className={`relative h-52 overflow-hidden bg-gradient-to-br ${gradient}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.14),transparent_28%)]" />

        <div className="absolute left-[14%] top-[22%] h-24 w-24 rounded-full border border-white/[0.08] bg-white/[0.025]" />

        <div className="absolute bottom-[-45px] right-[10%] h-40 w-40 rounded-full border border-white/[0.06] bg-white/[0.02]" />

        <span className="absolute right-6 top-6 text-6xl font-black text-white/[0.05]">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs capitalize backdrop-blur-xl">
            {project.status}
          </span>

          {project.genre && (
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300 backdrop-blur-xl">
              {project.genre}
            </span>
          )}
        </div>
      </div>

      {/* DETAILS */}
      <div className="p-7">
        <h3 className="text-2xl font-bold tracking-tight">
          {project.title}
        </h3>

        {project.description && (
          <p className="mt-4 line-clamp-3 leading-7 text-zinc-500">
            {project.description}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-5">
          <span className="text-xs uppercase tracking-[0.15em] text-zinc-600">
            {project.animation_style ||
              "Animation Project"}
          </span>

          <span className="flex items-center gap-2 text-sm font-medium text-violet-400">
            Enter world
            <ArrowRight
              size={15}
              className="transition group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </a>
  );
}
