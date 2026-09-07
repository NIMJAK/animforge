"use client";

import {
  Check,
  CheckCircle2,
  Clapperboard,
  Loader2,
  Plus,
  RefreshCw,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

type Character = {
  id: string;
  name: string;
  role: string | null;
};

type SceneCharacter = {
  id: string;
  character_id: string;
};

type ProductionTask = {
  id: string;
  title: string;
  status: string;
  production_type: string | null;
};

type ProductionType =
  | "storyboard"
  | "background"
  | "animation"
  | "voice"
  | "sound"
  | "editing"
  | "compositing";

const PRODUCTION_TYPES: {
  id: ProductionType;
  label: string;
  description: string;
}[] = [
  {
    id: "storyboard",
    label: "Storyboard",
    description:
      "Plan shots, framing and visual storytelling.",
  },
  {
    id: "background",
    label: "Background",
    description:
      "Create environments and background artwork.",
  },
  {
    id: "animation",
    label: "Animation",
    description:
      "Animate characters and scene action.",
  },
  {
    id: "voice",
    label: "Voice",
    description:
      "Record or prepare character dialogue.",
  },
  {
    id: "sound",
    label: "Sound",
    description:
      "Sound effects, ambience and audio design.",
  },
  {
    id: "editing",
    label: "Editing",
    description:
      "Assemble shots and refine scene timing.",
  },
  {
    id: "compositing",
    label: "Compositing",
    description:
      "Combine animation, effects and final visuals.",
  },
];

export default function SceneProductionPanel({
  projectId,
  sceneId,
  sceneNumber,
  sceneTitle,
  userId,
}: {
  projectId: string;
  sceneId: string;
  sceneNumber: number;
  sceneTitle: string;
  userId: string;
}) {
  const [
    characters,
    setCharacters,
  ] =
    useState<Character[]>([]);

  const [
    links,
    setLinks,
  ] =
    useState<
      SceneCharacter[]
    >([]);

  const [
    tasks,
    setTasks,
  ] =
    useState<
      ProductionTask[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    updatingCharacter,
    setUpdatingCharacter,
  ] =
    useState<
      string | null
    >(null);

  const [
    creatingTasks,
    setCreatingTasks,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  useEffect(() => {
    void loadProductionData();
  }, [
    projectId,
    sceneId,
  ]);

  async function loadProductionData() {
    setLoading(true);
    setError("");

    const supabase =
      createClient();

    const [
      charactersResult,
      linksResult,
      tasksResult,
    ] =
      await Promise.all([
        supabase
          .from(
            "project_characters"
          )
          .select(
            "id, name, role"
          )
          .eq(
            "project_id",
            projectId
          )
          .order(
            "name",
            {
              ascending:
                true,
            }
          ),

        supabase
          .from(
            "scene_characters"
          )
          .select(
            "id, character_id"
          )
          .eq(
            "scene_id",
            sceneId
          ),

        supabase
          .from("tasks")
          .select(`
            id,
            title,
            status,
            production_type
          `)
          .eq(
            "scene_id",
            sceneId
          )
          .order(
            "created_at",
            {
              ascending:
                true,
            }
          ),
      ]);

    if (
      charactersResult.error
    ) {
      setError(
        charactersResult.error.message
      );
    }

    if (
      linksResult.error
    ) {
      setError(
        linksResult.error.message
      );
    }

    if (
      tasksResult.error
    ) {
      setError(
        tasksResult.error.message
      );
    }

    setCharacters(
      (charactersResult.data ||
        []) as Character[]
    );

    setLinks(
      (linksResult.data ||
        []) as SceneCharacter[]
    );

    setTasks(
      (tasksResult.data ||
        []) as ProductionTask[]
    );

    setLoading(false);
  }

  const linkedCharacterIds =
    useMemo(
      () =>
        new Set(
          links.map(
            (link) =>
              link.character_id
          )
        ),
      [links]
    );

  const existingProductionTypes =
    useMemo(
      () =>
        new Set(
          tasks
            .map(
              (task) =>
                task.production_type
            )
            .filter(
              Boolean
            )
        ),
      [tasks]
    );

  async function toggleCharacter(
    characterId: string
  ) {
    if (
      updatingCharacter
    ) {
      return;
    }

    setUpdatingCharacter(
      characterId
    );

    setError("");
    setSuccess("");

    const supabase =
      createClient();

    const alreadyLinked =
      linkedCharacterIds.has(
        characterId
      );

    if (alreadyLinked) {
      const {
        error:
          deleteError,
      } =
        await supabase
          .from(
            "scene_characters"
          )
          .delete()
          .eq(
            "scene_id",
            sceneId
          )
          .eq(
            "character_id",
            characterId
          );

      if (deleteError) {
        setError(
          deleteError.message
        );

        setUpdatingCharacter(
          null
        );

        return;
      }

      setLinks(
        (current) =>
          current.filter(
            (link) =>
              link.character_id !==
              characterId
          )
      );
    } else {
      const {
        data,
        error:
          insertError,
      } =
        await supabase
          .from(
            "scene_characters"
          )
          .insert({
            project_id:
              projectId,

            scene_id:
              sceneId,

            character_id:
              characterId,

            created_by:
              userId,
          })
          .select(
            "id, character_id"
          )
          .single();

      if (insertError) {
        setError(
          insertError.message
        );

        setUpdatingCharacter(
          null
        );

        return;
      }

      setLinks(
        (current) => [
          ...current,
          data as SceneCharacter,
        ]
      );
    }

    setUpdatingCharacter(
      null
    );
  }

  async function createProductionTasks() {
    if (
      creatingTasks
    ) {
      return;
    }

    const missing =
      PRODUCTION_TYPES.filter(
        (type) =>
          !existingProductionTypes.has(
            type.id
          )
      );

    if (
      missing.length ===
      0
    ) {
      setSuccess(
        "All standard production tasks already exist for this scene."
      );

      return;
    }

    setCreatingTasks(true);

    setError("");
    setSuccess("");

    const supabase =
      createClient();

    const rows =
      missing.map(
        (type) => ({
          project_id:
            projectId,

          scene_id:
            sceneId,

          created_by:
            userId,

          title:
            `Scene ${sceneNumber} — ${type.label}: ${sceneTitle}`,

          description:
            `${type.description}

Linked to Scene ${sceneNumber}: ${sceneTitle}`,

          status:
            "backlog",

          production_type:
            type.id,
        })
      );

    const {
      data,
      error:
        insertError,
    } =
      await supabase
        .from("tasks")
        .insert(rows)
        .select(`
          id,
          title,
          status,
          production_type
        `);

    if (insertError) {
      setError(
        insertError.message
      );

      setCreatingTasks(
        false
      );

      return;
    }

    setTasks(
      (current) => [
        ...current,
        ...(
          (data ||
            []) as ProductionTask[]
        ),
      ]
    );

    setSuccess(
      `${missing.length} production task${
        missing.length ===
        1
          ? ""
          : "s"
      } created and added to the Project Board ✓`
    );

    setCreatingTasks(
      false
    );
  }

  if (loading) {
    return (
      <div className="mt-7 flex items-center gap-2 rounded-[24px] border border-white/10 bg-black/20 p-6 text-sm text-zinc-500">

        <Loader2
          size={16}
          className="animate-spin"
        />

        Loading scene production data...

      </div>
    );
  }

  return (
    <section className="mt-8 border-t border-white/[0.08] pt-8">

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            Production
          </p>

          <h3 className="mt-2 text-2xl font-black">
            Scene Production
          </h3>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            Connect characters and turn this scene into production work.
          </p>

        </div>

        <button
          type="button"
          onClick={
            loadProductionData
          }
          className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-500 transition hover:text-white"
        >
          <RefreshCw
            size={13}
          />

          Refresh
        </button>

      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
          {success}
        </div>
      )}

      {/* CHARACTERS */}

      <div className="mt-7 rounded-[24px] border border-white/[0.08] bg-black/15 p-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
            <UserRound
              size={18}
            />
          </div>

          <div>

            <h4 className="font-bold">
              Characters in Scene
            </h4>

            <p className="mt-0.5 text-xs text-zinc-600">
              Select the characters who appear in this scene.
            </p>

          </div>

        </div>

        {characters.length ===
        0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-600">
            No saved characters yet. Create characters in Project Assets or Character Studio first.
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">

            {characters.map(
              (character) => {
                const selected =
                  linkedCharacterIds.has(
                    character.id
                  );

                const updating =
                  updatingCharacter ===
                  character.id;

                return (
                  <button
                    key={
                      character.id
                    }
                    type="button"
                    disabled={
                      Boolean(
                        updatingCharacter
                      )
                    }
                    onClick={() =>
                      toggleCharacter(
                        character.id
                      )
                    }
                    className={`flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-fuchsia-500/30 bg-fuchsia-500/10"
                        : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05]"
                    }`}
                  >

                    <div className="min-w-0">

                      <p className="truncate font-semibold">
                        {
                          character.name
                        }
                      </p>

                      <p className="mt-1 truncate text-xs text-zinc-600">
                        {character.role ||
                          "Character"}
                      </p>

                    </div>

                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-fuchsia-400 bg-fuchsia-500 text-white"
                          : "border-white/10 text-zinc-700"
                      }`}
                    >

                      {updating ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : selected ? (
                        <Check
                          size={14}
                        />
                      ) : (
                        <Plus
                          size={14}
                        />
                      )}

                    </div>

                  </button>
                );
              }
            )}

          </div>
        )}

        <p className="mt-4 text-xs text-zinc-700">
          {
            linkedCharacterIds.size
          }{" "}
          character
          {linkedCharacterIds.size ===
          1
            ? ""
            : "s"}{" "}
          attached
        </p>

      </div>

      {/* PRODUCTION TASKS */}

      <div className="mt-5 rounded-[24px] border border-white/[0.08] bg-black/15 p-5">

        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
              <Clapperboard
                size={18}
              />
            </div>

            <div>

              <h4 className="font-bold">
                Production Tasks
              </h4>

              <p className="mt-0.5 text-xs text-zinc-600">
                These tasks appear automatically on the existing Project Board.
              </p>

            </div>

          </div>

          <button
            type="button"
            disabled={
              creatingTasks
            }
            onClick={
              createProductionTasks
            }
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-400 disabled:opacity-40"
          >

            {creatingTasks ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Plus
                size={15}
              />
            )}

            {creatingTasks
              ? "Creating..."
              : tasks.length
              ? "Create Missing Tasks"
              : "Create Production Tasks"}

          </button>

        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">

          {PRODUCTION_TYPES.map(
            (type) => {
              const task =
                tasks.find(
                  (item) =>
                    item.production_type ===
                    type.id
                );

              return (
                <div
                  key={
                    type.id
                  }
                  className={`rounded-2xl border p-4 ${
                    task
                      ? "border-green-500/15 bg-green-500/[0.05]"
                      : "border-white/[0.07] bg-white/[0.02]"
                  }`}
                >

                  <div className="flex items-center justify-between gap-3">

                    <div>

                      <p className="font-semibold">
                        {
                          type.label
                        }
                      </p>

                      <p className="mt-1 text-xs leading-5 text-zinc-600">
                        {
                          type.description
                        }
                      </p>

                    </div>

                    {task ? (
                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-green-400"
                      />
                    ) : (
                      <div className="h-4 w-4 shrink-0 rounded-full border border-white/10" />
                    )}

                  </div>

                  {task && (
                    <div className="mt-3">

                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] capitalize text-zinc-500">
                        {task.status.replace(
                          "_",
                          " "
                        )}
                      </span>

                    </div>
                  )}

                </div>
              );
            }
          )}

        </div>

      </div>

    </section>
  );
}
