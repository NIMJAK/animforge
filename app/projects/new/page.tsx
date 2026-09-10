"use client";

import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clapperboard,
  Eye,
  Globe2,
  Lock,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import {
  AnimForgeLogo,
  PageBackground,
  inputStyle,
  selectStyle,
} from "@/components/animforge/ui";

export default function CreateProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [genre, setGenre] = useState("");
  const [animationStyle, setAnimationStyle] =
    useState("");

  const [targetAudience, setTargetAudience] =
    useState("");

  const [visibility, setVisibility] =
    useState("public");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function createProject(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage(
        "Give your project a title."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const baseSlug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const slug = `${baseSlug || "project"}-${Date.now()
      .toString()
      .slice(-6)}`;

    const { error } = await supabase
      .from("projects")
      .insert({
        owner_id: user.id,
        title: title.trim(),
        slug,
        description:
          description.trim() || null,
        genre: genre.trim() || null,
        animation_style:
          animationStyle.trim() || null,
        target_audience:
          targetAudience.trim() || null,
        visibility,
        status: "planning",
      });

    if (error) {
      console.error(error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push(`/projects/${slug}`);
    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">
      <PageBackground />

      {/* NAV */}
      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">
          <AnimForgeLogo />

          <Link
            href="/projects"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft size={16} />
            Projects
          </Link>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-[1400px] gap-12 px-6 pb-24 pt-14 lg:grid-cols-[0.7fr_1.3fr]">

        {/* LEFT */}
        <aside className="lg:sticky lg:top-28 lg:self-start">

          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            <WandSparkles size={15} />
            Start a new world
          </div>

          <h1 className="mt-8 text-5xl font-black leading-[1.02] tracking-[-0.04em] md:text-6xl">
            Every world
            <br />
            begins with
            <br />

            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              an idea.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">
            Create your project, describe its
            universe and then invite the creators
            you need to bring it to life.
          </p>

          {/* MINI PREVIEW */}
          <div className="mt-10 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] backdrop-blur-xl">

            <div className="relative h-40 bg-gradient-to-br from-violet-500/25 via-fuchsia-500/10 to-blue-500/10">
              <div className="absolute right-6 top-6">
                <Clapperboard className="text-violet-300" />
              </div>

              <div className="absolute bottom-5 left-5">
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300 backdrop-blur">
                  {genre || "Your Genre"}
                </span>
              </div>
            </div>

            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                Project Preview
              </p>

              <h2 className="mt-3 text-xl font-semibold">
                {title || "Untitled World"}
              </h2>

              <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-500">
                {description ||
                  "Your project description will appear here."}
              </p>
            </div>

          </div>

        </aside>

        {/* FORM */}
        <form
          onSubmit={createProject}
          className="rounded-[34px] border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-10"
        >

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
            <Sparkles size={21} />
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
            Project Foundation
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Define your world.
          </h2>

          <p className="mt-3 text-zinc-500">
            Don&apos;t worry about making everything
            perfect. You can grow the project with
            your team.
          </p>

          {/* TITLE */}
          <div className="mt-9">
            <label className="mb-2 block text-sm text-zinc-400">
              Project title
            </label>

            <input
              required
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="The Last Sky"
              className={inputStyle}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">
            <label className="mb-2 block text-sm text-zinc-400">
              Tell us about the world
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={6}
              placeholder="What's the story? What makes this project interesting? What do you want to create?"
              className={`${inputStyle} resize-none`}
            />
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">

            {/* GENRE */}
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Genre
              </label>

              <input
                value={genre}
                onChange={(e) =>
                  setGenre(e.target.value)
                }
                placeholder="Fantasy, Sci-Fi..."
                className={inputStyle}
              />
            </div>

            {/* STYLE */}
            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Animation style
              </label>

              <input
                value={animationStyle}
                onChange={(e) =>
                  setAnimationStyle(
                    e.target.value
                  )
                }
                placeholder="2D, Anime, 3D..."
                className={inputStyle}
              />
            </div>

          </div>

          {/* AUDIENCE */}
          <div className="mt-6">
            <label className="mb-2 block text-sm text-zinc-400">
              Target audience
            </label>

            <input
              value={targetAudience}
              onChange={(e) =>
                setTargetAudience(
                  e.target.value
                )
              }
              placeholder="Kids, teens, young adults..."
              className={inputStyle}
            />
          </div>

          {/* VISIBILITY */}
          <div className="mt-9">
            <p className="text-sm font-medium text-zinc-300">
              Who can discover this project?
            </p>

            <p className="mt-1 text-sm text-zinc-600">
              Choose how visible your world should
              be on AnimForge.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2">

              <VisibilityCard
                icon={<Globe2 size={20} />}
                title="Public"
                text="Anyone can discover the project."
                active={visibility === "public"}
                onClick={() =>
                  setVisibility("public")
                }
              />

              <VisibilityCard
                icon={<Users size={20} />}
                title="Team"
                text="Visible to your project team."
                active={visibility === "team"}
                onClick={() =>
                  setVisibility("team")
                }
              />

              <VisibilityCard
                icon={<Eye size={20} />}
                title="Unlisted"
                text="Accessible through its direct link."
                active={
                  visibility === "unlisted"
                }
                onClick={() =>
                  setVisibility("unlisted")
                }
              />

              <VisibilityCard
                icon={<Lock size={20} />}
                title="Private"
                text="Only you can access the project."
                active={
                  visibility === "private"
                }
                onClick={() =>
                  setVisibility("private")
                }
              />

            </div>

            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(
                  e.target.value
                )
              }
              className={`${selectStyle} mt-5 md:hidden`}
            >
              <option value="public">
                Public
              </option>

              <option value="team">
                Team
              </option>

              <option value="unlisted">
                Unlisted
              </option>

              <option value="private">
                Private
              </option>
            </select>
          </div>

          {message && (
            <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {message}
            </div>
          )}

          <div className="mt-9 flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-7 sm:flex-row sm:items-center sm:justify-between">

            <Link
              href="/projects"
              className="text-center text-sm text-zinc-500 transition hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Forging your world..."
                : "Create Project"}

              {!loading && (
                <ArrowRight
                  size={17}
                  className="transition group-hover:translate-x-1"
                />
              )}
            </button>

          </div>

        </form>

      </section>
    </main>
  );
}

function VisibilityCard({
  icon,
  title,
  text,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${
        active
          ? "border-violet-500/40 bg-violet-500/10"
          : "border-white/10 bg-black/20 hover:border-white/20"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          active
            ? "bg-violet-500/15 text-violet-300"
            : "bg-white/[0.04] text-zinc-500"
        }`}
      >
        {icon}
      </div>

      <h3
        className={`mt-4 font-semibold ${
          active
            ? "text-white"
            : "text-zinc-300"
        }`}
      >
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-600">
        {text}
      </p>
    </button>
  );
}
