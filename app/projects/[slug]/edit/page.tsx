"use client";

import {
  ArrowLeft,
  Loader2,
  Save,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import {
  AnimForgeLogo,
  PageBackground,
  inputStyle,
  selectStyle,
} from "@/components/animforge/ui";

type Project = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  genre: string | null;
  animation_style: string | null;
  target_audience: string | null;
  visibility: string;
  status: string;
};

export default function EditProjectPage() {
  const router = useRouter();

  const params =
    useParams<{
      slug: string;
    }>();

  const slug =
    params.slug;

  const [project, setProject] =
    useState<Project | null>(
      null
    );

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [genre, setGenre] =
    useState("");

  const [
    animationStyle,
    setAnimationStyle,
  ] = useState("");

  const [
    targetAudience,
    setTargetAudience,
  ] = useState("");

  const [
    visibility,
    setVisibility,
  ] = useState("private");

  const [status, setStatus] =
    useState("planning");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    async function loadProject() {
      const supabase =
        createClient();

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        router.push(
          "/auth/login"
        );

        return;
      }

      const {
        data,
        error:
          projectError,
      } =
        await supabase
          .from("projects")
          .select(
            `
            id,
            owner_id,
            title,
            description,
            genre,
            animation_style,
            target_audience,
            visibility,
            status
            `
          )
          .eq(
            "slug",
            slug
          )
          .single();

      if (
        projectError ||
        !data
      ) {
        setError(
          "Project not found."
        );

        setLoading(false);

        return;
      }

      if (
        data.owner_id !==
        user.id
      ) {
        setError(
          "Only the project owner can edit this project."
        );

        setLoading(false);

        return;
      }

      setProject(
        data as Project
      );

      setTitle(
        data.title || ""
      );

      setDescription(
        data.description || ""
      );

      setGenre(
        data.genre || ""
      );

      setAnimationStyle(
        data.animation_style ||
          ""
      );

      setTargetAudience(
        data.target_audience ||
          ""
      );

      setVisibility(
        data.visibility ||
          "private"
      );

      setStatus(
        data.status ||
          "planning"
      );

      setLoading(false);
    }

    void loadProject();
  }, [
    router,
    slug,
  ]);

  async function saveProject() {
    if (
      !project ||
      saving
    ) {
      return;
    }

    if (!title.trim()) {
      setError(
        "Project title cannot be empty."
      );

      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase =
        createClient();

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        router.push(
          "/auth/login"
        );

        return;
      }

      const {
        error:
          updateError,
      } =
        await supabase
          .from("projects")
          .update({
            title:
              title.trim(),

            description:
              description.trim(),

            genre:
              genre || null,

            animation_style:
              animationStyle ||
              null,

            target_audience:
              targetAudience ||
              null,

            visibility,

            status,
          })
          .eq(
            "id",
            project.id
          )
          .eq(
            "owner_id",
            user.id
          );

      if (updateError) {
        throw updateError;
      }

      setSuccess(
        "Project updated successfully."
      );

      setTimeout(() => {
        router.push(
          `/projects/${slug}`
        );

        router.refresh();
      }, 700);
    } catch (err) {
      console.error(
        "UPDATE PROJECT ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not update project."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060608] text-white">

        <Loader2
          size={30}
          className="animate-spin text-violet-400"
        />

      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <a
            href={`/projects/${slug}`}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            Back to Project
          </a>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[900px] px-6 py-12">

        <div className="rounded-[36px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl md:p-10">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Project Settings
          </p>

          <h1 className="mt-3 text-4xl font-black">
            Edit Project
          </h1>

          <p className="mt-4 text-zinc-500">
            Update your existing AnimForge project without creating a new one.
          </p>

          {error && (
            <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-7 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
              {success}
            </div>
          )}

          {project && (
            <div className="mt-8 space-y-6">

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  Project Title
                </label>

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(
                      e.target.value
                    )
                  }
                  className={
                    inputStyle
                  }
                  placeholder="Project title"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm text-zinc-400">
                  Description / Blueprint
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={14}
                  className={`${inputStyle} resize-y`}
                  placeholder="Project description..."
                />

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <SelectField
                  label="Genre"
                  value={genre}
                  onChange={
                    setGenre
                  }
                  options={[
                    "",
                    "Fantasy",
                    "Adventure",
                    "Comedy",
                    "Drama",
                    "Sci-Fi",
                    "Horror",
                    "Action",
                    "Romance",
                    "Educational",
                  ]}
                />

                <SelectField
                  label="Animation Style"
                  value={
                    animationStyle
                  }
                  onChange={
                    setAnimationStyle
                  }
                  options={[
                    "",
                    "2D",
                    "3D",
                    "Anime",
                    "Stop Motion",
                    "Motion Graphics",
                    "Mixed Media",
                  ]}
                />

                <SelectField
                  label="Target Audience"
                  value={
                    targetAudience
                  }
                  onChange={
                    setTargetAudience
                  }
                  options={[
                    "",
                    "Kids",
                    "Teens",
                    "Young Adults",
                    "Adults",
                    "Family",
                    "General",
                  ]}
                />

                <SelectField
                  label="Visibility"
                  value={
                    visibility
                  }
                  onChange={
                    setVisibility
                  }
                  options={[
                    "private",
                    "public",
                    "team",
                    "unlisted",
                  ]}
                />

                <SelectField
                  label="Project Status"
                  value={status}
                  onChange={
                    setStatus
                  }
                  options={[
                    "planning",
                    "active",
                    "paused",
                    "completed",
                  ]}
                />

              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-5 text-sm leading-6 text-zinc-500">
                Changing the title will
                <strong className="text-zinc-300">
                  {" "}not change the existing project URL
                </strong>.
                Your team, tasks, applications and chat remain connected to the same project.
              </div>

              <button
                type="button"
                onClick={
                  saveProject
                }
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-6 py-4 font-bold text-white transition hover:bg-violet-400 disabled:opacity-40"
              >

                {saving ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Save
                    size={18}
                  />
                )}

                {saving
                  ? "Saving Changes..."
                  : "Save Project Changes"}

              </button>

            </div>
          )}

        </div>

      </section>

    </main>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange:
    (value: string) => void;
  options: string[];
}) {
  return (
    <div>

      <label className="mb-2 block text-sm text-zinc-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className={selectStyle}
      >

        {options.map(
          (option) => (
            <option
              key={
                option ||
                "empty"
              }
              value={option}
            >
              {option ||
                "Not specified"}
            </option>
          )
        )}

      </select>

    </div>
  );
}
