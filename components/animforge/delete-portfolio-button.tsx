"use client";

import {
  Loader2,
  Trash2,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/client";

export default function DeletePortfolioButton({
  itemId,
  storagePath,
  title,
}: {
  itemId: string;
  storagePath?: string | null;
  title: string;
}) {
  const router =
    useRouter();

  const [
    deleting,
    setDeleting,
  ] =
    useState(false);

  async function deleteWork() {
    if (deleting) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${title}" from your portfolio?`
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    const supabase =
      createClient();

    try {
      // Delete database record first
      const {
        error:
          databaseError,
      } =
        await supabase
          .from(
            "portfolio_items"
          )
          .delete()
          .eq(
            "id",
            itemId
          );

      if (databaseError) {
        throw databaseError;
      }

      // Remove image from Storage
      if (storagePath) {
        const {
          error:
            storageError,
        } =
          await supabase.storage
            .from(
              "portfolio"
            )
            .remove([
              storagePath,
            ]);

        if (storageError) {
          console.warn(
            "Portfolio image cleanup failed:",
            storageError.message
          );
        }
      }

      router.refresh();
    } catch (error) {
      console.error(
        "DELETE PORTFOLIO ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Could not delete portfolio work."
      );

      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      disabled={deleting}
      onClick={
        deleteWork
      }
      className="mt-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/15 disabled:opacity-40"
    >
      {deleting ? (
        <Loader2
          size={15}
          className="animate-spin"
        />
      ) : (
        <Trash2
          size={15}
        />
      )}

      {deleting
        ? "Deleting..."
        : "Delete Work"}
    </button>
  );
}
