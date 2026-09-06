"use client";

import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Sparkles,
  UserPlus,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import {
  AnimForgeLogo,
  PageBackground,
} from "@/components/animforge/ui";

type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  href: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const router =
    useRouter();

  const [
    notifications,
    setNotifications,
  ] =
    useState<
      Notification[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    markingAll,
    setMarkingAll,
  ] =
    useState(false);

  useEffect(() => {
    const supabase =
      createClient();

    let cancelled =
      false;

    let channel:
      | ReturnType<
          typeof supabase.channel
        >
      | null = null;

    async function loadPage() {
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
        error,
      } =
        await supabase
          .from(
            "notifications"
          )
          .select(`
            id,
            user_id,
            type,
            title,
            message,
            href,
            is_read,
            created_at
          `)
          .eq(
            "user_id",
            user.id
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "NOTIFICATION LOAD ERROR:",
          error
        );

        setMessage(
          error.message
        );

        setLoading(false);
        return;
      }

      setNotifications(
        data || []
      );

      setLoading(false);

      /*
       * Realtime notification updates.
       * Unique channel name prevents the
       * React development duplicate issue.
       */
      channel =
        supabase
          .channel(
            `notification-page-${user.id}-${crypto.randomUUID()}`
          )
          .on(
            "postgres_changes",
            {
              event:
                "INSERT",

              schema:
                "public",

              table:
                "notifications",

              filter:
                `user_id=eq.${user.id}`,
            },
            (payload) => {
              const incoming =
                payload.new as Notification;

              setNotifications(
                (current) => {
                  const exists =
                    current.some(
                      (notification) =>
                        notification.id ===
                        incoming.id
                    );

                  if (exists) {
                    return current;
                  }

                  return [
                    incoming,
                    ...current,
                  ];
                }
              );
            }
          )
          .subscribe();
    }

    void loadPage();

    return () => {
      cancelled = true;

      if (channel) {
        void supabase.removeChannel(
          channel
        );

        channel = null;
      }
    };
  }, [router]);

  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            !notification.is_read
        ).length,
      [notifications]
    );

  async function openNotification(
    notification: Notification
  ) {
    const supabase =
      createClient();

    if (!notification.is_read) {
      const { error } =
        await supabase
          .from(
            "notifications"
          )
          .update({
            is_read: true,
          })
          .eq(
            "id",
            notification.id
          );

      if (!error) {
        setNotifications(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                notification.id
                  ? {
                      ...item,
                      is_read: true,
                    }
                  : item
            )
        );
      }
    }

    if (
      notification.href
    ) {
      router.push(
        notification.href
      );
    }
  }

  async function markAllRead() {
    if (
      unreadCount === 0
    ) {
      return;
    }

    setMarkingAll(true);
    setMessage("");

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

    const { error } =
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

    if (error) {
      setMessage(
        error.message
      );

      setMarkingAll(false);
      return;
    }

    setNotifications(
      (current) =>
        current.map(
          (notification) => ({
            ...notification,
            is_read: true,
          })
        )
    );

    setMarkingAll(false);
  }

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060608] text-white">

        <PageBackground />

        <div className="relative z-10 text-center">
          <Bell
            size={31}
            className="mx-auto text-violet-400"
          />

          <p className="mt-5 text-zinc-500">
            Gathering your updates...
          </p>
        </div>

      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      {/* NAVBAR */}
      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1300px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <a
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            Dashboard
          </a>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[1100px] px-6 pb-24 pt-12">

        {/* HERO */}
        <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl md:p-10">

          <div className="absolute right-[-120px] top-[-130px] h-[380px] w-[380px] rounded-full bg-violet-500/20 blur-[130px]" />

          <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">

                <Sparkles
                  size={14}
                />

                Creator Activity

              </div>

              <h1 className="mt-6 text-4xl font-black tracking-[-0.04em] md:text-5xl">
                Notifications
              </h1>

              <p className="mt-4 max-w-xl leading-7 text-zinc-400">
                Keep track of applications,
                collaborations, task assignments
                and activity around your AnimForge
                projects.
              </p>

            </div>

            <div className="flex items-center gap-3">

              <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-center">

                <p className="text-2xl font-black">
                  {unreadCount}
                </p>

                <p className="mt-1 text-xs text-zinc-600">
                  Unread
                </p>

              </div>

              <button
                type="button"
                disabled={
                  unreadCount === 0 ||
                  markingAll
                }
                onClick={
                  markAllRead
                }
                className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-35"
              >

                <Check
                  size={16}
                />

                {markingAll
                  ? "Updating..."
                  : "Mark all read"}

              </button>

            </div>

          </div>

        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {message}
          </div>
        )}

        {/* LIST */}
        <section className="mt-10">

          <div className="flex items-end justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-400">
                Activity Feed
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Recent Updates
              </h2>

            </div>

            <span className="text-sm text-zinc-600">
              {notifications.length} total
            </span>

          </div>

          {notifications.length >
          0 ? (

            <div className="mt-6 space-y-3">

              {notifications.map(
                (notification) => (

                  <button
                    key={
                      notification.id
                    }
                    type="button"
                    onClick={() =>
                      openNotification(
                        notification
                      )
                    }
                    className={`group w-full rounded-[26px] border p-5 text-left transition md:p-6 ${
                      notification.is_read
                        ? "border-white/[0.07] bg-white/[0.025] hover:bg-white/[0.04]"
                        : "border-violet-500/20 bg-violet-500/[0.07] hover:border-violet-500/35"
                    }`}
                  >

                    <div className="flex gap-4">

                      <NotificationIcon
                        type={
                          notification.type
                        }
                      />

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <div className="flex items-center gap-2">

                              <h3 className={`font-semibold ${
                                notification.is_read
                                  ? "text-zinc-300"
                                  : "text-white"
                              }`}>
                                {
                                  notification.title
                                }
                              </h3>

                              {!notification.is_read && (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-violet-400" />
                              )}

                            </div>

                            {notification.message && (
                              <p className="mt-2 leading-7 text-zinc-500">
                                {
                                  notification.message
                                }
                              </p>
                            )}

                          </div>

                          <span className="hidden shrink-0 items-center gap-1.5 text-xs text-zinc-700 sm:flex">

                            <Clock3
                              size={12}
                            />

                            {formatRelativeTime(
                              notification.created_at
                            )}

                          </span>

                        </div>

                        <div className="mt-4 flex items-center justify-between">

                          <span className="text-xs capitalize text-zinc-700">
                            {formatType(
                              notification.type
                            )}
                          </span>

                          {notification.href && (
                            <span className="text-xs font-medium text-violet-400 opacity-0 transition group-hover:opacity-100">
                              Open →
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                  </button>

                )
              )}

            </div>

          ) : (

            <div className="mt-6 rounded-[30px] border border-dashed border-white/10 bg-white/[0.02] p-14 text-center">

              <Bell
                size={30}
                className="mx-auto text-zinc-700"
              />

              <h3 className="mt-5 text-xl font-semibold">
                Nothing new yet.
              </h3>

              <p className="mx-auto mt-3 max-w-md leading-7 text-zinc-600">
                Applications, task assignments and
                collaboration updates will appear
                here.
              </p>

            </div>

          )}

        </section>

      </section>

    </main>
  );
}

function NotificationIcon({
  type,
}: {
  type: string;
}) {
  let icon =
    <Bell size={18} />;

  let style =
    "bg-violet-500/10 text-violet-300";

  if (
    type ===
    "application"
  ) {
    icon =
      <UserPlus
        size={18}
      />;

    style =
      "bg-blue-500/10 text-blue-300";
  }

  if (
    type ===
    "application_accepted"
  ) {
    icon =
      <CheckCircle2
        size={18}
      />;

    style =
      "bg-green-500/10 text-green-300";
  }

  if (
    type ===
    "application_rejected"
  ) {
    icon =
      <BriefcaseBusiness
        size={18}
      />;

    style =
      "bg-red-500/10 text-red-300";
  }

  if (
    type ===
    "task_assignment"
  ) {
    icon =
      <ClipboardList
        size={18}
      />;

    style =
      "bg-fuchsia-500/10 text-fuchsia-300";
  }

  return (
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style}`}
    >
      {icon}
    </div>
  );
}

function formatType(
  type: string
) {
  const names:
    Record<
      string,
      string
    > = {
      application:
        "Application",

      application_accepted:
        "Application accepted",

      application_rejected:
        "Application update",

      task_assignment:
        "Task assignment",
    };

  return (
    names[type] ||
    type.replaceAll(
      "_",
      " "
    )
  );
}

function formatRelativeTime(
  date: string
) {
  const created =
    new Date(date);

  const now =
    new Date();

  const seconds =
    Math.floor(
      (
        now.getTime() -
        created.getTime()
      ) / 1000
    );

  if (seconds < 60) {
    return "Now";
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days}d`;
  }

  return created.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
    }
  );
}
