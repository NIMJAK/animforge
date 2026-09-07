"use client";

import {
  AlertTriangle,
  Trash2,
} from "lucide-react";

import {
  useParams,
} from "next/navigation";

export default function DeleteProjectLink() {
  const params =
    useParams<{
      slug: string;
    }>();

  const slug =
    decodeURIComponent(
      params.slug
    );

  return (
    <section className="mt-10 rounded-[28px] border border-red-500/25 bg-red-500/[0.06] p-6 md:p-8">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <AlertTriangle
            size={20}
          />
        </div>

        <div className="flex-1">

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">
            Danger Zone
          </p>

          <h2 className="mt-2 text-xl font-black">
            Delete this project
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
            Permanently delete this project,
            including its scenes, characters,
            tasks and other project data.
          </p>

          <a
            href={`/projects/${slug}/delete`}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-500"
          >
            <Trash2
              size={16}
            />

            Delete Project
          </a>

        </div>

      </div>

    </section>
  );
}
