"use client";

import {
  Bell,
  CheckCheck,
  ChevronRight,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  href: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsBell() {
  const router = useRouter();

  const [loggedIn, setLoggedIn] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const supabase =
      createClient();

    let cancelled = false;

    let channel:
      | ReturnType<
          typeof supabase.channel
        >
      | null = null;

    async function start() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (
        cancelled ||
        !user
      ) {
        setLoggedIn(false);
        return;
      }

      const userId =
        user.id;

      setLoggedIn(true);

      async function loadNotifications() {
        const {
          data,
          error,
        } =
          await supabase
            .from("notifications")
            .select(
              `
              id,
              type,
              title,
              message,
              href,
              is_read,
              created_at
              `
            )
            .eq(
              "user_id",
              userId
            )
            .order(
              "created_at",
              {
                ascending:
                  false,
              }
            )
            .limit(20);

        if (
          cancelled ||
          error
        ) {
          return;
        }

        const rows =
          (data ||
            []) as Notification[];

        setNotifications(
          rows
        );

        setUnreadCount(
          rows.filter(
            (item) =>
              !item.is_read
          ).length
        );
      }

      await loadNotifications();

      channel = supabase
        .channel(
          `notification-drawer-${userId}-${crypto.randomUUID()}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table:
              "notifications",
            filter:
              `user_id=eq.${userId}`,
          },
          () => {
            void loadNotifications();
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

  useEffect(() => {
    function escape(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      escape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        escape
      );
    };
  }, []);

  async function openNotification(
    item: Notification
  ) {
    const supabase =
      createClient();

    if (!item.is_read) {
      await supabase
        .from("notifications")
        .update({
          is_read: true,
        })
        .eq(
          "id",
          item.id
        );

      setNotifications(
        (current) =>
          current.map(
            (notification) =>
              notification.id ===
              item.id
                ? {
                    ...notification,
                    is_read:
                      true,
                  }
                : notification
          )
      );

      setUnreadCount(
        (current) =>
          Math.max(
            0,
            current - 1
          )
      );
    }

    setOpen(false);

    if (item.href) {
      router.push(
        item.href
      );
    }
  }

  async function markAllRead() {
    setLoading(true);

    try {
      const supabase =
        createClient();

      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const {
        error,
      } =
        await supabase
          .from(
            "notifications"
          )
          .update({
            is_read: true,
          })
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "is_read",
            false
          );

      if (!error) {
        setNotifications(
          (current) =>
            current.map(
              (item) => ({
                ...item,
                is_read:
                  true,
              })
            )
        );

        setUnreadCount(0);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!loggedIn) {
    return null;
  }

  return (
    <>
      {/* BELL */}
      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        title="Notifications"
        aria-label="Open notifications"
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#111116]/90 text-zinc-400 shadow-xl shadow-black/30 backdrop-blur-xl transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300"
      >
        <Bell size={19} />

        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#060608] bg-violet-500 px-1 text-[10px] font-bold text-white">
            {unreadCount >
            99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* OVERLAY */}
      {open && (
        <button
          type="button"
          aria-label="Close notifications"
          onClick={() =>
            setOpen(false)
          }
          className="fixed inset-0 z-[199] cursor-default bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* SIDE DRAWER */}
      <aside
        className={`fixed right-0 top-0 z-[200] flex h-dvh w-full max-w-[420px] flex-col border-l border-white/10 bg-[#0b0b0f]/95 shadow-2xl shadow-black/60 backdrop-blur-2xl transition-transform duration-300 ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="border-b border-white/[0.07] p-6">

          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                AnimForge
              </p>

              <h2 className="mt-1 text-2xl font-black text-white">
                Notifications
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {unreadCount >
                0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
            >
              <X size={18} />
            </button>

          </div>

          {unreadCount >
            0 && (
            <button
              type="button"
              disabled={
                loading
              }
              onClick={
                markAllRead
              }
              className="mt-5 flex items-center gap-2 text-sm font-medium text-violet-300 transition hover:text-violet-200 disabled:opacity-40"
            >
              <CheckCheck
                size={16}
              />

              {loading
                ? "Updating..."
                : "Mark all as read"}
            </button>
          )}

        </div>

        {/* NOTIFICATIONS */}
        <div className="flex-1 overflow-y-auto">

          {notifications.length ===
          0 ? (
            <div className="flex h-full items-center justify-center p-10 text-center">

              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-600">
                  <Bell
                    size={22}
                  />
                </div>

                <h3 className="mt-5 font-semibold text-white">
                  No notifications yet
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Applications,
                  project messages and
                  task updates will
                  appear here.
                </p>
              </div>

            </div>
          ) : (
            <div>
              {notifications.map(
                (item) => (
                  <button
                    type="button"
                    key={
                      item.id
                    }
                    onClick={() =>
                      void openNotification(
                        item
                      )
                    }
                    className={`group flex w-full items-start gap-4 border-b border-white/[0.05] p-5 text-left transition hover:bg-white/[0.04] ${
                      !item.is_read
                        ? "bg-violet-500/[0.06]"
                        : ""
                    }`}
                  >

                    <div className="relative mt-1">

                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          !item.is_read
                            ? "bg-violet-500/15 text-violet-300"
                            : "bg-white/[0.04] text-zinc-600"
                        }`}
                      >
                        <Bell
                          size={17}
                        />
                      </div>

                      {!item.is_read && (
                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#0b0b0f] bg-violet-400" />
                      )}

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-3">

                        <p
                          className={`text-sm leading-6 ${
                            !item.is_read
                              ? "font-semibold text-white"
                              : "font-medium text-zinc-300"
                          }`}
                        >
                          {item.title}
                        </p>

                        {item.href && (
                          <ChevronRight
                            size={
                              15
                            }
                            className="mt-1 shrink-0 text-zinc-700 transition group-hover:text-violet-400"
                          />
                        )}

                      </div>

                      {item.message && (
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-500">
                          {
                            item.message
                          }
                        </p>
                      )}

                      <p className="mt-2 text-xs text-zinc-700">
                        {formatTime(
                          item.created_at
                        )}
                      </p>

                    </div>

                  </button>
                )
              )}
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="border-t border-white/[0.07] p-4">

          <button
            type="button"
            onClick={() => {
              setOpen(
                false
              );

              router.push(
                "/notifications"
              );
            }}
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            View notification history
          </button>

        </div>

      </aside>
    </>
  );
}

function formatTime(
  dateString: string
) {
  const date =
    new Date(
      dateString
    );

  const difference =
    Date.now() -
    date.getTime();

  const minutes =
    Math.floor(
      difference /
        60000
    );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
}
