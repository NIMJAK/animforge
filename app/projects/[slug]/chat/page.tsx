"use client";

import {
  ArrowLeft,
  MessageCircle,
  Send,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
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
} from "@/components/animforge/ui";

type Project = {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
};

type Message = {
  id: string;
  project_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

type Creator = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export default function TeamChatPage() {
  const params =
    useParams<{
      slug: string;
    }>();

  const router =
    useRouter();

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
    currentUserId,
    setCurrentUserId,
  ] =
    useState("");

  const [
    messages,
    setMessages,
  ] =
    useState<Message[]>([]);

  const [
    creators,
    setCreators,
  ] =
    useState<Creator[]>([]);

  const [
    newMessage,
    setNewMessage,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState("");

  const bottomRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const creatorsMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          Creator
        >();

      creators.forEach(
        (creator) => {
          map.set(
            creator.id,
            creator
          );
        }
      );

      return map;
    }, [creators]);

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

    async function loadChat() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (
        cancelled
      ) {
        return;
      }

      if (!user) {
        router.push(
          "/auth/login"
        );

        return;
      }

      setCurrentUserId(
        user.id
      );

      /*
       * LOAD PROJECT
       */
      const {
        data: projectData,
        error: projectError,
      } =
        await supabase
          .from("projects")
          .select(`
            id,
            owner_id,
            title,
            slug
          `)
          .eq(
            "slug",
            slug
          )
          .maybeSingle();

      if (
        cancelled
      ) {
        return;
      }

      if (
        projectError ||
        !projectData
      ) {
        setErrorMessage(
          "Project not found or you don't have access."
        );

        setLoading(false);
        return;
      }

      /*
       * VERIFY TEAM ACCESS
       */
      const isOwner =
        projectData.owner_id ===
        user.id;

      let isMember =
        false;

      if (!isOwner) {
        const {
          data: membership,
        } =
          await supabase
            .from(
              "project_members"
            )
            .select(
              "user_id"
            )
            .eq(
              "project_id",
              projectData.id
            )
            .eq(
              "user_id",
              user.id
            )
            .maybeSingle();

        isMember =
          !!membership;
      }

      if (
        !isOwner &&
        !isMember
      ) {
        setErrorMessage(
          "Only project team members can enter this chat."
        );

        setLoading(false);
        return;
      }

      setProject(
        projectData
      );

      /*
       * MARK CHAT NOTIFICATIONS READ
       */
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
          "type",
          "project_message"
        )
        .eq(
          "href",
          `/projects/${projectData.slug}/chat`
        )
        .eq(
          "is_read",
          false
        );

      /*
       * LOAD TEAM
       */
      const {
        data: memberships,
      } =
        await supabase
          .from(
            "project_members"
          )
          .select(
            "user_id"
          )
          .eq(
            "project_id",
            projectData.id
          );

      const teamIds = [
        projectData.owner_id,

        ...(memberships?.map(
          (member) =>
            member.user_id
        ) || []),
      ];

      const uniqueTeamIds =
        [
          ...new Set(
            teamIds
          ),
        ];

      if (
        uniqueTeamIds.length >
        0
      ) {
        const {
          data: profileData,
        } =
          await supabase
            .from(
              "profiles"
            )
            .select(`
              id,
              username,
              display_name,
              avatar_url
            `)
            .in(
              "id",
              uniqueTeamIds
            );

        if (
          !cancelled
        ) {
          setCreators(
            profileData ||
              []
          );
        }
      }

      /*
       * LOAD OLD MESSAGES
       */
      const {
        data: messageData,
        error: messageError,
      } =
        await supabase
          .from(
            "project_messages"
          )
          .select(`
            id,
            project_id,
            sender_id,
            message,
            created_at
          `)
          .eq(
            "project_id",
            projectData.id
          )
          .order(
            "created_at",
            {
              ascending:
                true,
            }
          );

      if (
        cancelled
      ) {
        return;
      }

      if (
        messageError
      ) {
        setErrorMessage(
          messageError.message
        );

        setLoading(false);
        return;
      }

      setMessages(
        messageData || []
      );

      setLoading(false);

      /*
       * REALTIME CHAT
       */
      channel =
        supabase
          .channel(
            `chat-${projectData.id}-${crypto.randomUUID()}`
          )
          .on(
            "postgres_changes",
            {
              event:
                "INSERT",

              schema:
                "public",

              table:
                "project_messages",

              filter:
                `project_id=eq.${projectData.id}`,
            },
            (payload) => {
              const incoming =
                payload.new as Message;

              setMessages(
                (current) => {
                  const exists =
                    current.some(
                      (
                        message
                      ) =>
                        message.id ===
                        incoming.id
                    );

                  if (exists) {
                    return current;
                  }

                  return [
                    ...current,
                    incoming,
                  ];
                }
              );

              /*
               * User is already in chat,
               * so any new chat notification
               * should immediately be read.
               */
              if (
                incoming.sender_id !==
                user.id
              ) {
                setTimeout(
                  async () => {
                    await supabase
                      .from(
                        "notifications"
                      )
                      .update({
                        is_read:
                          true,
                      })
                      .eq(
                        "user_id",
                        user.id
                      )
                      .eq(
                        "type",
                        "project_message"
                      )
                      .eq(
                        "href",
                        `/projects/${projectData.slug}/chat`
                      )
                      .eq(
                        "is_read",
                        false
                      );
                  },
                  300
                );
              }
            }
          )
          .subscribe(
            (status) => {
              console.log(
                "CHAT REALTIME:",
                status
              );
            }
          );
    }

    void loadChat();

    return () => {
      cancelled =
        true;

      if (channel) {
        void supabase.removeChannel(
          channel
        );
      }
    };
  }, [
    router,
    slug,
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior:
          "smooth",
      }
    );
  }, [messages]);

  async function sendMessage(
    e?: FormEvent
  ) {
    e?.preventDefault();

    if (
      !project ||
      !newMessage.trim() ||
      sending
    ) {
      return;
    }

    setSending(true);
    setErrorMessage("");

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
      error,
    } =
      await supabase
        .from(
          "project_messages"
        )
        .insert({
          project_id:
            project.id,

          sender_id:
            user.id,

          message:
            newMessage.trim(),
        })
        .select()
        .single();

    if (error) {
      setErrorMessage(
        error.message
      );

      setSending(false);
      return;
    }

    /*
     * Add instantly on sender screen.
     */
    setMessages(
      (current) => {
        const exists =
          current.some(
            (message) =>
              message.id ===
              data.id
          );

        if (exists) {
          return current;
        }

        return [
          ...current,
          data,
        ];
      }
    );

    setNewMessage("");
    setSending(false);
  }

  function handleKeyDown(
    e: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      e.key ===
        "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      void sendMessage();
    }
  }

  async function deleteMessage(
    messageId: string
  ) {
    const supabase =
      createClient();

    const {
      error,
    } =
      await supabase
        .from(
          "project_messages"
        )
        .delete()
        .eq(
          "id",
          messageId
        );

    if (error) {
      setErrorMessage(
        error.message
      );

      return;
    }

    setMessages(
      (current) =>
        current.filter(
          (message) =>
            message.id !==
            messageId
        )
    );
  }

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#060608] text-white">

        <PageBackground />

        <div className="relative z-10 text-center">

          <MessageCircle
            size={32}
            className="mx-auto text-violet-400"
          />

          <p className="mt-5 text-zinc-500">
            Entering team chat...
          </p>

        </div>

      </main>
    );
  }

  if (!project) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[#060608] text-white">

        <PageBackground />

        <div className="relative z-10 max-w-lg px-6 text-center">

          <MessageCircle
            size={32}
            className="mx-auto text-violet-400"
          />

          <h1 className="mt-6 text-3xl font-black">
            Chat unavailable.
          </h1>

          <p className="mt-4 text-zinc-500">
            {errorMessage}
          </p>

          <a
            href={`/projects/${slug}`}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black"
          >
            <ArrowLeft
              size={16}
            />

            Return to Project
          </a>

        </div>

      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <div className="flex gap-2">

            <a
              href={`/projects/${project.slug}`}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-zinc-400 hover:text-white"
            >
              <ArrowLeft
                size={16}
              />

              Project
            </a>

            <a
              href={`/projects/${project.slug}/board`}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300"
            >
              Workspace
            </a>

          </div>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[1500px] px-6 pb-10 pt-10">

        <div className="grid min-h-[calc(100vh-150px)] overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.035] backdrop-blur-xl lg:grid-cols-[300px_1fr]">

          {/* TEAM */}
          <aside className="hidden border-r border-white/[0.07] bg-black/20 p-6 lg:block">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <Users
                  size={18}
                />
              </div>

              <div>

                <p className="text-xs uppercase tracking-[0.15em] text-zinc-600">
                  Project Team
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {creators.length} creators
                </p>

              </div>

            </div>

            <div className="mt-7 space-y-3">

              {creators.map(
                (creator) => {
                  const name =
                    creator.display_name ||
                    creator.username ||
                    "Creator";

                  return (
                    <a
                      key={
                        creator.id
                      }
                      href={
                        creator.username
                          ? `/creators/${creator.username}`
                          : "#"
                      }
                      className="flex items-center gap-3 rounded-2xl p-3 transition hover:bg-white/[0.04]"
                    >

                      {creator.avatar_url ? (
                        <img
                          src={
                            creator.avatar_url
                          }
                          alt={name}
                          className="h-10 w-10 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-sm font-bold text-violet-300">
                          {name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">

                        <p className="truncate text-sm font-medium">
                          {name}
                        </p>

                        <p className="mt-1 truncate text-xs text-zinc-700">
                          {creator.id ===
                          currentUserId
                            ? "You"
                            : `@${creator.username || "creator"}`}
                        </p>

                      </div>

                    </a>
                  );
                }
              )}

            </div>

          </aside>

          {/* CHAT */}
          <section className="flex min-h-[700px] flex-col">

            <header className="border-b border-white/[0.07] px-6 py-6 md:px-8">

              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">

                <Sparkles
                  size={13}
                />

                Production Chat

              </div>

              <h1 className="mt-2 text-2xl font-black">
                {project.title}
              </h1>

              <p className="mt-1 text-sm text-zinc-600">
                Real-time team communication
              </p>

            </header>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto px-5 py-8 md:px-8">

              {messages.length ===
              0 ? (

                <div className="flex min-h-[400px] items-center justify-center text-center">

                  <div>

                    <MessageCircle
                      size={34}
                      className="mx-auto text-violet-500"
                    />

                    <h2 className="mt-6 text-2xl font-bold">
                      Start the conversation.
                    </h2>

                  </div>

                </div>

              ) : (

                <div className="space-y-6">

                  {messages.map(
                    (message) => {
                      const creator =
                        creatorsMap.get(
                          message.sender_id
                        );

                      const name =
                        creator?.display_name ||
                        creator?.username ||
                        "Creator";

                      const mine =
                        message.sender_id ===
                        currentUserId;

                      return (
                        <div
                          key={
                            message.id
                          }
                          className={`flex ${
                            mine
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >

                          <div className="max-w-[75%]">

                            <p
                              className={`mb-2 text-xs text-zinc-600 ${
                                mine
                                  ? "text-right"
                                  : ""
                              }`}
                            >
                              {mine
                                ? "You"
                                : name}
                            </p>

                            <div
                              className={`group relative rounded-[22px] px-5 py-3.5 ${
                                mine
                                  ? "rounded-br-md bg-violet-600"
                                  : "rounded-bl-md border border-white/[0.08] bg-white/[0.04]"
                              }`}
                            >

                              <p className="whitespace-pre-wrap break-words leading-7">
                                {
                                  message.message
                                }
                              </p>

                              {mine && (
                                <button
                                  onClick={() =>
                                    deleteMessage(
                                      message.id
                                    )
                                  }
                                  className="absolute -left-9 top-1/2 hidden -translate-y-1/2 text-zinc-600 hover:text-red-400 group-hover:block"
                                >
                                  <Trash2
                                    size={14}
                                  />
                                </button>
                              )}

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                  <div
                    ref={
                      bottomRef
                    }
                  />

                </div>

              )}

            </div>

            {/* INPUT */}
            <form
              onSubmit={
                sendMessage
              }
              className="border-t border-white/[0.07] bg-black/20 p-5"
            >

              {errorMessage && (
                <div className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                  {
                    errorMessage
                  }
                </div>
              )}

              <div className="flex items-end gap-3 rounded-[24px] border border-white/10 bg-[#0b0b10] p-3">

                <textarea
                  value={
                    newMessage
                  }
                  onChange={(e) =>
                    setNewMessage(
                      e.target.value
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  rows={1}
                  placeholder="Message your team..."
                  className="min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-zinc-700"
                />

                <button
                  type="submit"
                  disabled={
                    sending ||
                    !newMessage.trim()
                  }
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black disabled:opacity-30"
                >
                  <Send
                    size={17}
                  />
                </button>

              </div>

            </form>

          </section>

        </div>

      </section>

    </main>
  );
}
