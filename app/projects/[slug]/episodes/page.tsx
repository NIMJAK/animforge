"use client";

import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clapperboard,
  Loader2,
  MapPin,
  Plus,
  Save,
  Trash2,
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
  selectStyle,
} from "@/components/animforge/ui";

type Project = {
  id: string;
  title: string;
};

type Episode = {
  id: string;
  project_id: string;
  created_by: string;
  episode_number: number;
  title: string;
  summary: string | null;
  status: string;
  created_at: string;
};

type Scene = {
  id: string;
  project_id: string;
  episode_id: string;
  created_by: string;
  scene_number: number;
  title: string;
  location: string | null;
  time_of_day: string | null;
  summary: string | null;
  script_content: string | null;
  status: string;
  created_at: string;
};

export default function EpisodesPage() {
  const router = useRouter();

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
    episodes,
    setEpisodes,
  ] =
    useState<Episode[]>([]);

  const [
    scenes,
    setScenes,
  ] =
    useState<Scene[]>([]);

  const [
    userId,
    setUserId,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    creatingEpisode,
    setCreatingEpisode,
  ] =
    useState(false);

  const [
    creatingSceneFor,
    setCreatingSceneFor,
  ] =
    useState<string | null>(
      null
    );

  const [
    editingEpisode,
    setEditingEpisode,
  ] =
    useState<Episode | null>(
      null
    );

  const [
    editingScene,
    setEditingScene,
  ] =
    useState<Scene | null>(
      null
    );

  const [
    expandedEpisodes,
    setExpandedEpisodes,
  ] =
    useState<
      Record<string, boolean>
    >({});

  useEffect(() => {
    void loadWorkspace();
  }, [slug]);

  async function loadWorkspace() {
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

    setUserId(
      user.id
    );

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
      episodeResult,
      sceneResult,
    ] =
      await Promise.all([
        supabase
          .from(
            "project_episodes"
          )
          .select("*")
          .eq(
            "project_id",
            projectData.id
          )
          .order(
            "episode_number",
            {
              ascending: true,
            }
          ),

        supabase
          .from(
            "project_scenes"
          )
          .select("*")
          .eq(
            "project_id",
            projectData.id
          )
          .order(
            "scene_number",
            {
              ascending: true,
            }
          ),
      ]);

    if (
      episodeResult.error
    ) {
      setError(
        episodeResult.error.message
      );
    }

    if (
      sceneResult.error
    ) {
      setError(
        sceneResult.error.message
      );
    }

    const loadedEpisodes =
      (episodeResult.data ||
        []) as Episode[];

    setEpisodes(
      loadedEpisodes
    );

    setScenes(
      (sceneResult.data ||
        []) as Scene[]
    );

    const expanded:
      Record<
        string,
        boolean
      > = {};

    loadedEpisodes.forEach(
      (episode) => {
        expanded[
          episode.id
        ] = true;
      }
    );

    setExpandedEpisodes(
      expanded
    );

    setLoading(false);
  }

  function getScenes(
    episodeId: string
  ) {
    return scenes.filter(
      (scene) =>
        scene.episode_id ===
        episodeId
    );
  }

  function toggleEpisode(
    episodeId: string
  ) {
    setExpandedEpisodes(
      (current) => ({
        ...current,

        [episodeId]:
          !current[
            episodeId
          ],
      })
    );
  }

  async function createEpisode(
    title: string,
    summary: string
  ) {
    if (
      !project ||
      !title.trim()
    ) {
      return;
    }

    setError("");

    const supabase =
      createClient();

    const nextNumber =
      episodes.length ===
      0
        ? 1
        : Math.max(
            ...episodes.map(
              (episode) =>
                episode.episode_number
            )
          ) + 1;

    const {
      data,
      error:
        insertError,
    } =
      await supabase
        .from(
          "project_episodes"
        )
        .insert({
          project_id:
            project.id,

          created_by:
            userId,

          episode_number:
            nextNumber,

          title:
            title.trim(),

          summary:
            summary.trim() ||
            null,

          status:
            "planning",
        })
        .select()
        .single();

    if (insertError) {
      setError(
        insertError.message
      );
      return;
    }

    const episode =
      data as Episode;

    setEpisodes(
      (current) => [
        ...current,
        episode,
      ]
    );

    setExpandedEpisodes(
      (current) => ({
        ...current,
        [episode.id]:
          true,
      })
    );

    setCreatingEpisode(
      false
    );
  }

  async function createScene(
    episode: Episode,
    title: string,
    summary: string
  ) {
    if (
      !project ||
      !title.trim()
    ) {
      return;
    }

    setError("");

    const episodeScenes =
      getScenes(
        episode.id
      );

    const nextNumber =
      episodeScenes.length ===
      0
        ? 1
        : Math.max(
            ...episodeScenes.map(
              (scene) =>
                scene.scene_number
            )
          ) + 1;

    const supabase =
      createClient();

    const {
      data,
      error:
        insertError,
    } =
      await supabase
        .from(
          "project_scenes"
        )
        .insert({
          project_id:
            project.id,

          episode_id:
            episode.id,

          created_by:
            userId,

          scene_number:
            nextNumber,

          title:
            title.trim(),

          summary:
            summary.trim() ||
            null,

          status:
            "planned",
        })
        .select()
        .single();

    if (insertError) {
      setError(
        insertError.message
      );
      return;
    }

    setScenes(
      (current) => [
        ...current,
        data as Scene,
      ]
    );

    setCreatingSceneFor(
      null
    );
  }

  async function saveEpisode() {
    if (
      !editingEpisode
    ) {
      return;
    }

    if (
      !editingEpisode.title.trim()
    ) {
      setError(
        "Episode title cannot be empty."
      );
      return;
    }

    const supabase =
      createClient();

    const {
      error:
        updateError,
    } =
      await supabase
        .from(
          "project_episodes"
        )
        .update({
          title:
            editingEpisode.title.trim(),

          summary:
            editingEpisode.summary?.trim() ||
            null,

          status:
            editingEpisode.status,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          editingEpisode.id
        );

    if (updateError) {
      setError(
        updateError.message
      );
      return;
    }

    setEpisodes(
      (current) =>
        current.map(
          (episode) =>
            episode.id ===
            editingEpisode.id
              ? editingEpisode
              : episode
        )
    );

    setEditingEpisode(
      null
    );
  }

  async function saveScene() {
    if (
      !editingScene
    ) {
      return;
    }

    if (
      !editingScene.title.trim()
    ) {
      setError(
        "Scene title cannot be empty."
      );
      return;
    }

    const supabase =
      createClient();

    const {
      error:
        updateError,
    } =
      await supabase
        .from(
          "project_scenes"
        )
        .update({
          title:
            editingScene.title.trim(),

          location:
            clean(
              editingScene.location
            ),

          time_of_day:
            clean(
              editingScene.time_of_day
            ),

          summary:
            clean(
              editingScene.summary
            ),

          script_content:
            clean(
              editingScene.script_content
            ),

          status:
            editingScene.status,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          editingScene.id
        );

    if (updateError) {
      setError(
        updateError.message
      );
      return;
    }

    setScenes(
      (current) =>
        current.map(
          (scene) =>
            scene.id ===
            editingScene.id
              ? editingScene
              : scene
        )
    );

    setEditingScene(
      null
    );
  }

  async function deleteEpisode(
    episode: Episode
  ) {
    if (
      episode.created_by !==
      userId
    ) {
      return;
    }

    if (
      !window.confirm(
        `Delete Episode ${episode.episode_number}? Its scenes will also be deleted.`
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
          "project_episodes"
        )
        .delete()
        .eq(
          "id",
          episode.id
        );

    if (deleteError) {
      setError(
        deleteError.message
      );
      return;
    }

    setEpisodes(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            episode.id
        )
    );

    setScenes(
      (current) =>
        current.filter(
          (scene) =>
            scene.episode_id !==
            episode.id
        )
    );
  }

  async function deleteScene(
    scene: Scene
  ) {
    if (
      scene.created_by !==
      userId
    ) {
      return;
    }

    if (
      !window.confirm(
        `Delete Scene ${scene.scene_number}?`
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
          "project_scenes"
        )
        .delete()
        .eq(
          "id",
          scene.id
        );

    if (deleteError) {
      setError(
        deleteError.message
      );
      return;
    }

    setScenes(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            scene.id
        )
    );
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
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <a
            href={`/projects/${slug}`}
            className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            Back to Project
          </a>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[1400px] px-6 pb-24 pt-10">

        <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.04] p-8 md:p-11">

          <div className="absolute right-[-100px] top-[-120px] h-[350px] w-[350px] rounded-full bg-violet-500/20 blur-[120px]" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
                <Clapperboard
                  size={16}
                />

                Story Production
              </div>

              <h1 className="mt-5 text-4xl font-black md:text-6xl">
                Episodes & Scenes
              </h1>

              <p className="mt-4 text-lg text-zinc-500">
                {project?.title}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setCreatingEpisode(
                  true
                )
              }
              className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-black"
            >
              <Plus
                size={18}
              />

              New Episode
            </button>

          </div>

        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {episodes.length ===
        0 ? (
          <div className="mt-8 rounded-[32px] border border-dashed border-white/10 p-14 text-center">

            <BookOpen
              size={40}
              className="mx-auto text-violet-500"
            />

            <h2 className="mt-5 text-2xl font-bold">
              Start your first episode
            </h2>

            <p className="mt-3 text-zinc-600">
              Organize your project into episodes and production-ready scenes.
            </p>

            <button
              type="button"
              onClick={() =>
                setCreatingEpisode(
                  true
                )
              }
              className="mt-6 rounded-2xl bg-violet-500 px-6 py-3 font-semibold"
            >
              Create Episode 1
            </button>

          </div>
        ) : (
          <div className="mt-8 space-y-6">

            {episodes.map(
              (episode) => {
                const episodeScenes =
                  getScenes(
                    episode.id
                  );

                const expanded =
                  expandedEpisodes[
                    episode.id
                  ];

                return (
                  <section
                    key={
                      episode.id
                    }
                    className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035]"
                  >

                    {/* EPISODE HEADER */}

                    <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">

                      <button
                        type="button"
                        onClick={() =>
                          toggleEpisode(
                            episode.id
                          )
                        }
                        className="flex flex-1 items-start gap-4 text-left"
                      >

                        <div className="mt-1 text-zinc-500">
                          {expanded ? (
                            <ChevronDown
                              size={20}
                            />
                          ) : (
                            <ChevronRight
                              size={20}
                            />
                          )}
                        </div>

                        <div>

                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                            Episode{" "}
                            {
                              episode.episode_number
                            }
                          </p>

                          <h2 className="mt-1 text-2xl font-black">
                            {
                              episode.title
                            }
                          </h2>

                          {episode.summary && (
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
                              {
                                episode.summary
                              }
                            </p>
                          )}

                        </div>

                      </button>

                      <div className="flex flex-wrap items-center gap-2">

                        <StatusBadge
                          status={
                            episode.status
                          }
                        />

                        <span className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-500">
                          {
                            episodeScenes.length
                          }{" "}
                          scenes
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setCreatingSceneFor(
                              episode.id
                            )
                          }
                          className="flex items-center gap-1.5 rounded-xl border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300"
                        >
                          <Plus
                            size={14}
                          />

                          Scene
                        </button>

                        {episode.created_by ===
                          userId && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setEditingEpisode(
                                  episode
                                )
                              }
                              className="rounded-xl border border-white/10 px-3 py-2 text-xs text-zinc-400"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteEpisode(
                                  episode
                                )
                              }
                              className="rounded-xl border border-red-500/15 p-2 text-red-400"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </>
                        )}

                      </div>

                    </div>

                    {/* SCENES */}

                    {expanded && (
                      <div className="border-t border-white/[0.07] bg-black/10 p-5">

                        {episodeScenes.length ===
                        0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              setCreatingSceneFor(
                                episode.id
                              )
                            }
                            className="w-full rounded-[22px] border border-dashed border-white/10 p-8 text-center text-sm text-zinc-600 transition hover:border-violet-500/30 hover:text-violet-300"
                          >
                            + Add the first scene to this episode
                          </button>
                        ) : (
                          <div className="grid gap-4">

                            {episodeScenes.map(
                              (scene) => (
                                <article
                                  key={
                                    scene.id
                                  }
                                  className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-white/15"
                                >

                                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                    <div>

                                      <div className="flex flex-wrap items-center gap-2">

                                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-fuchsia-400">
                                          Scene{" "}
                                          {
                                            scene.scene_number
                                          }
                                        </span>

                                        <StatusBadge
                                          status={
                                            scene.status
                                          }
                                        />

                                      </div>

                                      <h3 className="mt-2 text-xl font-bold">
                                        {
                                          scene.title
                                        }
                                      </h3>

                                      {(scene.location ||
                                        scene.time_of_day) && (
                                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">

                                          {scene.location && (
                                            <span className="flex items-center gap-1.5">
                                              <MapPin
                                                size={13}
                                              />

                                              {
                                                scene.location
                                              }
                                            </span>
                                          )}

                                          {scene.time_of_day && (
                                            <span>
                                              {
                                                scene.time_of_day
                                              }
                                            </span>
                                          )}

                                        </div>
                                      )}

                                      {scene.summary && (
                                        <p className="mt-4 max-w-4xl leading-7 text-zinc-500">
                                          {
                                            scene.summary
                                          }
                                        </p>
                                      )}

                                    </div>

                                    <div className="flex shrink-0 gap-2">

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingScene(
                                            scene
                                          )
                                        }
                                        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.05]"
                                      >
                                        Open Scene
                                      </button>

                                      {scene.created_by ===
                                        userId && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            deleteScene(
                                              scene
                                            )
                                          }
                                          className="rounded-xl border border-red-500/15 p-2.5 text-red-400"
                                        >
                                          <Trash2
                                            size={15}
                                          />
                                        </button>
                                      )}

                                    </div>

                                  </div>

                                </article>
                              )
                            )}

                          </div>
                        )}

                      </div>
                    )}

                  </section>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* CREATE EPISODE */}

      {creatingEpisode && (
        <CreateModal
          title="Create Episode"
          label="Episode Title"
          placeholder="The Hidden City"
          onClose={() =>
            setCreatingEpisode(
              false
            )
          }
          onCreate={
            createEpisode
          }
        />
      )}

      {/* CREATE SCENE */}

      {creatingSceneFor && (
        <CreateModal
          title="Create Scene"
          label="Scene Title"
          placeholder="The Arrival"
          onClose={() =>
            setCreatingSceneFor(
              null
            )
          }
          onCreate={(
            title,
            summary
          ) => {
            const episode =
              episodes.find(
                (item) =>
                  item.id ===
                  creatingSceneFor
              );

            if (episode) {
              void createScene(
                episode,
                title,
                summary
              );
            }
          }}
        />
      )}

      {/* EDIT EPISODE */}

      {editingEpisode && (
        <Modal
          title={`Episode ${editingEpisode.episode_number}`}
          onClose={() =>
            setEditingEpisode(
              null
            )
          }
        >

          <FieldLabel>
            Title
          </FieldLabel>

          <input
            value={
              editingEpisode.title
            }
            onChange={(e) =>
              setEditingEpisode({
                ...editingEpisode,
                title:
                  e.target.value,
              })
            }
            className={
              inputStyle
            }
          />

          <FieldLabel>
            Summary
          </FieldLabel>

          <textarea
            value={
              editingEpisode.summary ||
              ""
            }
            onChange={(e) =>
              setEditingEpisode({
                ...editingEpisode,
                summary:
                  e.target.value,
              })
            }
            rows={5}
            className={`${inputStyle} resize-y`}
          />

          <FieldLabel>
            Status
          </FieldLabel>

          <select
            value={
              editingEpisode.status
            }
            onChange={(e) =>
              setEditingEpisode({
                ...editingEpisode,
                status:
                  e.target.value,
              })
            }
            className={
              selectStyle
            }
          >
            <option value="planning">
              Planning
            </option>

            <option value="writing">
              Writing
            </option>

            <option value="production">
              Production
            </option>

            <option value="completed">
              Completed
            </option>
          </select>

          <SaveButton
            onClick={
              saveEpisode
            }
          />

        </Modal>
      )}

      {/* EDIT SCENE */}

      {editingScene && (
        <Modal
          title={`Scene ${editingScene.scene_number}`}
          onClose={() =>
            setEditingScene(
              null
            )
          }
        >

          <FieldLabel>
            Scene Title
          </FieldLabel>

          <input
            value={
              editingScene.title
            }
            onChange={(e) =>
              setEditingScene({
                ...editingScene,
                title:
                  e.target.value,
              })
            }
            className={
              inputStyle
            }
          />

          <div className="grid gap-4 md:grid-cols-2">

            <div>

              <FieldLabel>
                Location
              </FieldLabel>

              <input
                value={
                  editingScene.location ||
                  ""
                }
                onChange={(e) =>
                  setEditingScene({
                    ...editingScene,
                    location:
                      e.target.value,
                  })
                }
                placeholder="Forest temple"
                className={
                  inputStyle
                }
              />

            </div>

            <div>

              <FieldLabel>
                Time of Day
              </FieldLabel>

              <input
                value={
                  editingScene.time_of_day ||
                  ""
                }
                onChange={(e) =>
                  setEditingScene({
                    ...editingScene,
                    time_of_day:
                      e.target.value,
                  })
                }
                placeholder="Night"
                className={
                  inputStyle
                }
              />

            </div>

          </div>

          <FieldLabel>
            Scene Summary
          </FieldLabel>

          <textarea
            value={
              editingScene.summary ||
              ""
            }
            onChange={(e) =>
              setEditingScene({
                ...editingScene,
                summary:
                  e.target.value,
              })
            }
            rows={5}
            placeholder="What happens in this scene?"
            className={`${inputStyle} resize-y`}
          />

          <FieldLabel>
            Script
          </FieldLabel>

          <textarea
            value={
              editingScene.script_content ||
              ""
            }
            onChange={(e) =>
              setEditingScene({
                ...editingScene,
                script_content:
                  e.target.value,
              })
            }
            rows={16}
            placeholder="INT. ROOM — NIGHT

Character enters..."
            className={`${inputStyle} resize-y font-mono text-sm leading-7`}
          />

          <FieldLabel>
            Production Status
          </FieldLabel>

          <select
            value={
              editingScene.status
            }
            onChange={(e) =>
              setEditingScene({
                ...editingScene,
                status:
                  e.target.value,
              })
            }
            className={
              selectStyle
            }
          >
            <option value="planned">
              Planned
            </option>

            <option value="writing">
              Writing
            </option>

            <option value="ready">
              Ready
            </option>

            <option value="production">
              Production
            </option>

            <option value="completed">
              Completed
            </option>
          </select>

          {editingScene.created_by ===
            userId && (
            <SaveButton
              onClick={
                saveScene
              }
            />
          )}

        </Modal>
      )}

    </main>
  );
}

function CreateModal({
  title,
  label,
  placeholder,
  onClose,
  onCreate,
}: {
  title: string;
  label: string;
  placeholder: string;
  onClose:
    () => void;
  onCreate:
    (
      title: string,
      summary: string
    ) => void;
}) {
  const [
    name,
    setName,
  ] =
    useState("");

  const [
    summary,
    setSummary,
  ] =
    useState("");

  return (
    <Modal
      title={title}
      onClose={
        onClose
      }
    >

      <FieldLabel>
        {label}
      </FieldLabel>

      <input
        autoFocus
        value={name}
        onChange={(e) =>
          setName(
            e.target.value
          )
        }
        placeholder={
          placeholder
        }
        className={
          inputStyle
        }
      />

      <FieldLabel>
        Summary
      </FieldLabel>

      <textarea
        value={summary}
        onChange={(e) =>
          setSummary(
            e.target.value
          )
        }
        rows={5}
        placeholder="What happens here?"
        className={`${inputStyle} resize-y`}
      />

      <button
        type="button"
        disabled={
          !name.trim()
        }
        onClick={() =>
          onCreate(
            name,
            summary
          )
        }
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-6 py-4 font-bold disabled:opacity-40"
      >
        <Plus
          size={17}
        />

        Create
      </button>

    </Modal>
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
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">

      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-white/10 bg-[#101015] p-7 text-white">

        <div className="flex items-center justify-between">

          <h2 className="text-2xl font-black">
            {title}
          </h2>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-xl border border-white/10 p-2 text-zinc-400"
          >
            <X
              size={17}
            />
          </button>

        </div>

        <div className="mt-6">
          {children}
        </div>

      </div>

    </div>
  );
}

function FieldLabel({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <label className="mb-2 mt-5 block text-sm font-medium text-zinc-400">
      {children}
    </label>
  );
}

function SaveButton({
  onClick,
}: {
  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-6 py-4 font-bold transition hover:bg-violet-400"
    >
      <Save
        size={17}
      />

      Save Changes
    </button>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs capitalize text-zinc-400">
      {status.replace(
        "_",
        " "
      )}
    </span>
  );
}

function clean(
  value:
    string | null
) {
  const cleaned =
    value?.trim();

  return cleaned ||
    null;
}
