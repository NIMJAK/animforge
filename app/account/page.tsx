"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Trash2,
} from "lucide-react";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import {
  AnimForgeLogo,
  PageBackground,
} from "@/components/animforge/ui";

export default function AccountPage() {
  const router = useRouter();

  const [confirmation, setConfirmation] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  async function deleteAccount() {
    if (
      confirmation !== "DELETE" ||
      deleting
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "This will permanently delete your AnimForge account and may delete projects you own. This cannot be undone. Continue?"
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response =
        await fetch(
          "/api/account/delete",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
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
            "Could not delete account."
        );
      }

      try {
        const supabase =
          createClient();

        await supabase.auth.signOut();
      } catch {
        // User already deleted.
      }

      window.location.replace("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete account."
      );

      setDeleting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft size={16} />

            Back
          </button>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[850px] px-6 py-16">

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          Settings
        </p>

        <h1 className="mt-3 text-4xl font-black md:text-5xl">
          Account Settings
        </h1>

        <p className="mt-4 text-zinc-500">
          Manage your AnimForge account.
        </p>

        <section className="mt-12 rounded-[32px] border border-red-500/20 bg-red-500/[0.05] p-7 md:p-9">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <AlertTriangle size={22} />
          </div>

          <h2 className="mt-6 text-2xl font-black text-red-300">
            Delete Account
          </h2>

          <p className="mt-4 leading-7 text-zinc-400">
            This permanently deletes your
            AnimForge account. This action
            cannot be undone.
          </p>

          <div className="mt-6 rounded-2xl border border-red-500/15 bg-black/20 p-5 text-sm leading-7 text-zinc-500">

            <p>
              • Your account will no longer
              be accessible.
            </p>

            <p>
              • Your uploaded account files
              may be deleted.
            </p>

            <p>
              • Projects you own and their
              associated project data may
              also be deleted.
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
            value={confirmation}
            disabled={deleting}
            onChange={(e) =>
              setConfirmation(
                e.target.value
              )
            }
            placeholder="DELETE"
            className="mt-3 w-full rounded-2xl border border-red-500/20 bg-black/30 px-5 py-4 text-white outline-none placeholder:text-zinc-700 focus:border-red-500/50"
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
              deleteAccount
            }
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-30"
          >

            {deleting ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={18} />
            )}

            {deleting
              ? "Deleting Account..."
              : "Permanently Delete Account"}

          </button>

        </section>

      </section>

    </main>
  );
}
