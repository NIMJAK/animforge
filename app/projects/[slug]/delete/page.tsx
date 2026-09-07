"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/client";

import {
  AnimForgeLogo,
  PageBackground,
} from "@/components/animforge/ui";

type Project = {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
};

export default function DeleteProjectPage() {
  const router =
    useRouter();

  const params =
    useParams<{
      slug: string;
    }>();

  const slug =
    decodeURIComponent(
      params.slug
    );

  const [
    project,
    setProject,
  ] =
    useState<Project | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);

  const [
    confirmation,
    setConfirmation,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    void loadProject();
  }, [slug]);

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
          "id, owner_id, title, slug"
        )
        .eq(
          "slug",
          slug
        )
        .maybeSingle();

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
        "Only the project owner can delete this project."
      );

      setLoading(false);
      return;
    }

    setProject(
      data as Project
    );

    setLoading(false);
  }

  async function deleteProject() {
    if (
      !project ||
      confirmation !==
        "DELETE" ||
      deleting
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Permanently delete "${project.title}" and all of its project data?`
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/projects/${project.id}/delete`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                confirmation:
                  "DELETE",
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not delete project."
        );
      }

      window.location.replace(
        "/projects"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete project."
      );

      setDeleting(false);
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
    <main className="relative min-h-screen bg-[#060608] text-white">

      <PageBackground />

      <nav className="relative z-20 border-b border-white/5">

        <div className="mx-auto flex max-w-[900px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="flex items-center gap-2 text-sm text-zinc-400"
          >
            <ArrowLeft
              size={16}
            />

            Back
          </button>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[800px] px-6 py-16">

        {error &&
          !project ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-200">
            {error}
          </div>
        ) : project ? (
          <div className="rounded-[34px] border border-red-500/20 bg-red-500/[0.05] p-8 md:p-10">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">

              <AlertTriangle
                size={25}
              />

            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
              Danger Zone
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Delete Project
            </h1>

            <p className="mt-3 text-xl text-white">
              {project.title}
            </p>

            <p className="mt-5 leading-7 text-zinc-400">
              This permanently deletes the project
              and its associated production data.
              This cannot be undone.
            </p>

            <div className="mt-6 rounded-2xl border border-red-500/15 bg-black/20 p-5 text-sm leading-7 text-zinc-500">

              <p>
                • Episodes and scenes will be deleted.
              </p>

              <p>
                • Saved characters and story drafts will be deleted.
              </p>

              <p>
                • Project tasks will be deleted.
              </p>

              <p>
                • Applications and openings will be deleted.
              </p>

              <p>
                • Team memberships and chat data may be deleted.
              </p>

              <p>
                • Character reference images will be removed.
              </p>

            </div>

            <label className="mt-7 block text-sm text-zinc-400">
              Type{" "}
              <strong className="text-white">
                DELETE
              </strong>{" "}
              to confirm
            </label>

            <input
              value={
                confirmation
              }
              disabled={
                deleting
              }
              onChange={(e) =>
                setConfirmation(
                  e.target.value
                )
              }
              placeholder="DELETE"
              className="mt-3 w-full rounded-2xl border border-red-500/20 bg-black/30 px-5 py-4 outline-none placeholder:text-zinc-700 focus:border-red-500/50"
            />

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={
                confirmation !==
                  "DELETE" ||
                deleting
              }
              onClick={
                deleteProject
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 font-bold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-30"
            >

              {deleting ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Trash2
                  size={18}
                />
              )}

              {deleting
                ? "Deleting Project..."
                : "Permanently Delete Project"}

            </button>

          </div>
        ) : null}

      </section>

    </main>
  );
}
