"use client";

import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Pencil,
  Save,
  Trash2,
  UserRound,
  X,
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
} from "@/components/animforge/ui";

type Project = {
  id: string;
  title: string;
};

type StoryDraft = {
  id: string;
  project_id: string;
  created_by: string;
  title: string;
  draft_type: string;
  content: string;
  created_at: string;
};

type Character = {
  id: string;
  project_id: string;
  created_by: string;
  name: string;
  role: string | null;
  age_profile: string | null;
  personality: string | null;
  goal: string | null;
  flaw: string | null;
  visual_direction: string | null;
  relationship: string | null;
  raw_content: string;
  created_at: string;
};

type Tab =
  | "stories"
  | "characters";

export default function ProjectAssetsPage() {
  const router = useRouter();

  const params =
    useParams<{
      slug: string;
    }>();

  const slug =
    decodeURIComponent(
      params.slug
    );

  const [project, setProject] =
    useState<Project | null>(
      null
    );

  const [userId, setUserId] =
    useState("");

  const [stories, setStories] =
    useState<StoryDraft[]>([]);

  const [characters, setCharacters] =
    useState<Character[]>([]);

  const [tab, setTab] =
    useState<Tab>("stories");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    editingStory,
    setEditingStory,
  ] =
    useState<StoryDraft | null>(
      null
    );

  const [
    editingCharacter,
    setEditingCharacter,
  ] =
    useState<Character | null>(
      null
    );

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    void loadEverything();
  }, [slug]);

  async function loadEverything() {
    setLoading(true);
    setError("");

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

    setUserId(user.id);

    const {
      data: projectData,
      error: projectError,
    } =
      await supabase
        .from("projects")
        .select(
          "id, title"
        )
        .eq(
          "slug",
          slug
        )
        .maybeSingle();

    if (
      projectError ||
      !projectData
    ) {
      setError(
        "Project not found or you do not have access."
      );

      setLoading(false);

      return;
    }

    setProject(
      projectData
    );

    const [
      storyResult,
      characterResult,
    ] =
      await Promise.all([
        supabase
          .from(
            "project_story_drafts"
          )
          .select(`
            id,
            project_id,
            created_by,
            title,
            draft_type,
            content,
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
                false,
            }
          ),

        supabase
          .from(
            "project_characters"
          )
          .select(`
            id,
            project_id,
            created_by,
            name,
            role,
            age_profile,
            personality,
            goal,
            flaw,
            visual_direction,
            relationship,
            raw_content,
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
                false,
            }
          ),
      ]);

    if (
      storyResult.error
    ) {
      setError(
        storyResult.error.message
      );
    }

    if (
      characterResult.error
    ) {
      setError(
        characterResult.error.message
      );
    }

    setStories(
      (storyResult.data ||
        []) as StoryDraft[]
    );

    setCharacters(
      (characterResult.data ||
        []) as Character[]
    );

    setLoading(false);
  }

  async function saveStory() {
    if (
      !editingStory ||
      saving
    ) {
      return;
    }

    if (
      !editingStory.title.trim() ||
      !editingStory.content.trim()
    ) {
      setError(
        "Story title and content cannot be empty."
      );

      return;
    }

    setSaving(true);
    setError("");

    const supabase =
      createClient();

    const {
      error:
        updateError,
    } =
      await supabase
        .from(
          "project_story_drafts"
        )
        .update({
          title:
            editingStory.title.trim(),

          content:
            editingStory.content.trim(),

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          editingStory.id
        );

    if (updateError) {
      setError(
        updateError.message
      );

      setSaving(false);

      return;
    }

    setEditingStory(null);

    await loadEverything();

    setSaving(false);
  }

  async function saveCharacter() {
    if (
      !editingCharacter ||
      saving
    ) {
      return;
    }

    if (
      !editingCharacter.name.trim()
    ) {
      setError(
        "Character name cannot be empty."
      );

      return;
    }

    setSaving(true);
    setError("");

    const supabase =
      createClient();

    const {
      error:
        updateError,
    } =
      await supabase
        .from(
          "project_characters"
        )
        .update({
          name:
            editingCharacter.name.trim(),

          role:
            editingCharacter.role?.trim() ||
            null,

          age_profile:
            editingCharacter.age_profile?.trim() ||
            null,

          personality:
            editingCharacter.personality?.trim() ||
            null,

          goal:
            editingCharacter.goal?.trim() ||
            null,

          flaw:
            editingCharacter.flaw?.trim() ||
            null,

          visual_direction:
            editingCharacter.visual_direction?.trim() ||
            null,

          relationship:
            editingCharacter.relationship?.trim() ||
            null,

          raw_content:
            editingCharacter.raw_content.trim(),

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          editingCharacter.id
        );

    if (updateError) {
      setError(
        updateError.message
      );

      setSaving(false);

      return;
    }

    setEditingCharacter(
      null
    );

    await loadEverything();

    setSaving(false);
  }

  async function deleteStory(
    id: string
  ) {
    if (
      !window.confirm(
        "Delete this story draft?"
      )
    ) {
      return;
    }

    const supabase =
      createClient();

    const {
      error:
        deleteError,
    } =
      await supabase
        .from(
          "project_story_drafts"
        )
        .delete()
        .eq(
          "id",
          id
        );

    if (deleteError) {
      setError(
        deleteError.message
      );

      return;
    }

    setStories(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    );
  }

  async function deleteCharacter(
    id: string
  ) {
    if (
      !window.confirm(
        "Delete this character?"
      )
    ) {
      return;
    }

    const supabase =
      createClient();

    const {
      error:
        deleteError,
    } =
      await supabase
        .from(
          "project_characters"
        )
        .delete()
        .eq(
          "id",
          id
        );

    if (deleteError) {
      setError(
        deleteError.message
      );

      return;
    }

    setCharacters(
      (current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060608] text-white">
        <Loader2
          className="animate-spin text-violet-400"
          size={30}
        />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <a
            href={`/projects/${slug}`}
            className="flex items-center gap-2 text-sm text-zinc-400"
          >
            <ArrowLeft
              size={16}
            />

            Back to Project
          </a>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[1400px] px-6 pb-24 pt-10">

        <div className="rounded-[38px] border border-white/10 bg-white/[0.04] p-8 md:p-11">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Production Library
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-6xl">
            Project Assets
          </h1>

          <p className="mt-4 text-lg text-zinc-500">
            {project?.title}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() =>
                setTab(
                  "stories"
                )
              }
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold ${
                tab ===
                "stories"
                  ? "bg-violet-500 text-white"
                  : "border border-white/10 text-zinc-400"
              }`}
            >
              <BookOpen
                size={17}
              />

              Story Drafts

              <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">
                {
                  stories.length
                }
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setTab(
                  "characters"
                )
              }
              className={`flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold ${
                tab ===
                "characters"
                  ? "bg-fuchsia-500 text-white"
                  : "border border-white/10 text-zinc-400"
              }`}
            >
              <UserRound
                size={17}
              />

              Characters

              <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">
                {
                  characters.length
                }
              </span>
            </button>

          </div>

        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        {tab ===
        "stories" ? (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">

            {stories.length ===
            0 ? (
              <EmptyState
                title="No story drafts yet"
                text="Create one from the Project AI Workspace."
              />
            ) : (
              stories.map(
                (story) => (
                  <article
                    key={
                      story.id
                    }
                    className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <p className="text-xs uppercase tracking-[0.15em] text-violet-400">
                          {
                            story.draft_type
                          }
                        </p>

                        <h2 className="mt-2 text-xl font-bold">
                          {
                            story.title
                          }
                        </h2>

                      </div>

                      {story.created_by ===
                        userId && (
                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setEditingStory(
                                story
                              )
                            }
                            className="rounded-xl border border-white/10 p-2.5 text-zinc-400 hover:text-white"
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteStory(
                                story.id
                              )
                            }
                            className="rounded-xl border border-red-500/10 p-2.5 text-red-400"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>

                        </div>
                      )}

                    </div>

                    <p className="mt-5 line-clamp-8 whitespace-pre-wrap leading-7 text-zinc-500">
                      {
                        story.content
                      }
                    </p>

                    <p className="mt-5 text-xs text-zinc-700">
                      {new Date(
                        story.created_at
                      ).toLocaleString()}
                    </p>

                  </article>
                )
              )
            )}

          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {characters.length ===
            0 ? (
              <EmptyState
                title="No characters yet"
                text="Build and save a character from the AI Workspace."
              />
            ) : (
              characters.map(
                (character) => (
                  <article
                    key={
                      character.id
                    }
                    className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-300">
                        <UserRound
                          size={20}
                        />
                      </div>

                      {character.created_by ===
                        userId && (
                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setEditingCharacter(
                                character
                              )
                            }
                            className="rounded-xl border border-white/10 p-2.5 text-zinc-400"
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteCharacter(
                                character.id
                              )
                            }
                            className="rounded-xl border border-red-500/10 p-2.5 text-red-400"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>

                        </div>
                      )}

                    </div>

                    <h2 className="mt-5 text-2xl font-black">
                      {
                        character.name
                      }
                    </h2>

                    {character.role && (
                      <p className="mt-1 text-sm text-fuchsia-400">
                        {
                          character.role
                        }
                      </p>
                    )}

                    {character.personality && (
                      <p className="mt-5 leading-7 text-zinc-500">
                        {
                          character.personality
                        }
                      </p>
                    )}

                    <div className="mt-5 space-y-2 text-sm text-zinc-600">

                      {character.goal && (
                        <p>
                          <strong className="text-zinc-400">
                            Goal:
                          </strong>{" "}
                          {
                            character.goal
                          }
                        </p>
                      )}

                      {character.flaw && (
                        <p>
                          <strong className="text-zinc-400">
                            Flaw:
                          </strong>{" "}
                          {
                            character.flaw
                          }
                        </p>
                      )}

                    </div>

                  </article>
                )
              )
            )}

          </div>
        )}

      </section>

      {/* STORY EDIT MODAL */}

      {editingStory && (
        <Modal
          title="Edit Story Draft"
          onClose={() =>
            setEditingStory(
              null
            )
          }
        >

          <input
            value={
              editingStory.title
            }
            onChange={(e) =>
              setEditingStory({
                ...editingStory,
                title:
                  e.target.value,
              })
            }
            className={
              inputStyle
            }
          />

          <textarea
            value={
              editingStory.content
            }
            onChange={(e) =>
              setEditingStory({
                ...editingStory,
                content:
                  e.target.value,
              })
            }
            rows={20}
            className={`${inputStyle} mt-4 resize-y`}
          />

          <SaveButton
            saving={saving}
            onClick={
              saveStory
            }
          />

        </Modal>
      )}

      {/* CHARACTER EDIT MODAL */}

      {editingCharacter && (
        <Modal
          title="Edit Character"
          onClose={() =>
            setEditingCharacter(
              null
            )
          }
        >

          <div className="grid gap-4 md:grid-cols-2">

            <EditInput
              label="Name"
              value={
                editingCharacter.name
              }
              onChange={(
                value
              ) =>
                setEditingCharacter({
                  ...editingCharacter,
                  name: value,
                })
              }
            />

            <EditInput
              label="Role"
              value={
                editingCharacter.role ||
                ""
              }
              onChange={(
                value
              ) =>
                setEditingCharacter({
                  ...editingCharacter,
                  role: value,
                })
              }
            />

            <EditInput
              label="Age / Profile"
              value={
                editingCharacter.age_profile ||
                ""
              }
              onChange={(
                value
              ) =>
                setEditingCharacter({
                  ...editingCharacter,
                  age_profile:
                    value,
                })
              }
            />

            <EditInput
              label="Personality"
              value={
                editingCharacter.personality ||
                ""
              }
              onChange={(
                value
              ) =>
                setEditingCharacter({
                  ...editingCharacter,
                  personality:
                    value,
                })
              }
            />

            <EditInput
              label="Goal"
              value={
                editingCharacter.goal ||
                ""
              }
              onChange={(
                value
              ) =>
                setEditingCharacter({
                  ...editingCharacter,
                  goal: value,
                })
              }
            />

            <EditInput
              label="Flaw"
              value={
                editingCharacter.flaw ||
                ""
              }
              onChange={(
                value
              ) =>
                setEditingCharacter({
                  ...editingCharacter,
                  flaw: value,
                })
              }
            />

          </div>

          <textarea
            value={
              editingCharacter.raw_content
            }
            onChange={(e) =>
              setEditingCharacter({
                ...editingCharacter,
                raw_content:
                  e.target.value,
              })
            }
            rows={18}
            className={`${inputStyle} mt-5 resize-y`}
          />

          <SaveButton
            saving={saving}
            onClick={
              saveCharacter
            }
          />

        </Modal>
      )}

    </main>
  );
}

function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="col-span-full rounded-[28px] border border-dashed border-white/10 p-12 text-center">

      <h3 className="text-xl font-bold">
        {title}
      </h3>

      <p className="mt-2 text-zinc-600">
        {text}
      </p>

    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose:
    () => void;
  children:
    React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-white/10 bg-[#101015] p-7">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-black">
            {title}
          </h2>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl border border-white/10 p-2"
          >
            <X size={17} />
          </button>

        </div>

        {children}

      </div>

    </div>
  );
}

function EditInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange:
    (
      value: string
    ) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm text-zinc-500">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className={
          inputStyle
        }
      />

    </div>
  );
}

function SaveButton({
  saving,
  onClick,
}: {
  saving: boolean;
  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      disabled={saving}
      onClick={
        onClick
      }
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-6 py-4 font-bold disabled:opacity-40"
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
        ? "Saving..."
        : "Save Changes"}

    </button>
  );
}
