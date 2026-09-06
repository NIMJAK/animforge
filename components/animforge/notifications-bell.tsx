"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function NotificationsBell() {
  const [loggedIn, setLoggedIn] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  useEffect(() => {
    const supabase =
      createClient();

    let cancelled = false;

    let channel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    async function start() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        setLoggedIn(false);
        return;
      }

      setLoggedIn(true);

      async function loadUnread() {
        const {
          count,
          error,
        } =
          await supabase
            .from("notifications")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq(
              "user_id",
              user.id
            )
            .eq(
              "is_read",
              false
            );

        if (
          !cancelled &&
          !error
        ) {
          setUnreadCount(
            count || 0
          );
        }
      }

      await loadUnread();

      if (cancelled) return;

      channel =
        supabase
          .channel(
            `global-notifications-${user.id}-${crypto.randomUUID()}`
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table:
                "notifications",
              filter:
                `user_id=eq.${user.id}`,
            },
            () => {
              void loadUnread();
            }
          )
          .subscribe();
    }

    void start();

    return () => {
      cancelled = true;

      if (channel) {
        void supabase.removeChannel(
          channel
        );
      }
    };
  }, []);

  if (!loggedIn) {
    return null;
  }

  return (
    <a
      href="/notifications"
      title="Notifications"
      className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#111116]/90 text-zinc-400 shadow-xl shadow-black/30 backdrop-blur-xl transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300"
    >
      <Bell size={19} />

      {unreadCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#060608] bg-violet-500 px-1 text-[10px] font-bold text-white">
          {unreadCount > 99
            ? "99+"
            : unreadCount}
        </span>
      )}
    </a>
  );
}
