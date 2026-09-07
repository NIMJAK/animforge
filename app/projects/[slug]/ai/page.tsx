"use client";

import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  Check,
  Copy,
  Cpu,
  Gauge,
  Loader2,
  Save,
  Sparkles,
  UserRound,
  WandSparkles,
} from "lucide-react";

import {
  useEffect,
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
  inputStyle,
  selectStyle,
} from "@/components/animforge/ui";

const FAST_MODEL =
  "SmolLM2-360M-Instruct-q4f32_1-MLC";

const QUALITY_MODEL =
  "Qwen2.5-1.5B-Instruct-q4f32_1-MLC";

type AIMode =
  | "fast"
  | "quality";

type ToolMode =
  | "story"
  | "character";

type StoryMode =
  | "continue"
  | "scene"
  | "dialogue"
  | "pacing"
  | "conflict"
  | "ending"
  | "rewrite";

type Project = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  genre: string | null;
  animation_style: string | null;
  target_audience: string | null;
  status: string;
};

export default function ProjectAIPage() {
  const router = useRouter();

  const params =
    useParams<{
      slug: string;
    }>();

  const slug =
    decodeURIComponent(
      params.slug
    );

  const engineRef =
    useRef<any>(null);

  const loadedModelRef =
    useRef<string | null>(
      null
    );

  const [project, setProject] =
    useState<Project | null>(
      null
    );

  const [
    loadingProject,
    setLoadingProject,
  ] = useState(true);

  const [toolMode, setToolMode] =
    useState<ToolMode>("story");

  const [aiMode, setAIMode] =
    useState<AIMode>("fast");

  const [
    storyMode,
    setStoryMode,
  ] =
    useState<StoryMode>(
      "continue"
    );

  const [
    instruction,
    setInstruction,
  ] = useState("");

  const [
    characterName,
    setCharacterName,
  ] = useState("");

  const [
    characterRole,
    setCharacterRole,
  ] = useState("");

  const [
    characterAge,
    setCharacterAge,
  ] = useState("");

  const [
    personality,
    setPersonality,
  ] = useState("");

  const [
    characterGoal,
    setCharacterGoal,
  ] = useState("");

  const [
    characterFlaw,
    setCharacterFlaw,
  ] = useState("");

  const [
    visualDirection,
    setVisualDirection,
  ] = useState("");

  const [
    relationship,
    setRelationship,
  ] = useState("");

  const [result, setResult] =
    useState("");

  const [status, setStatus] =
    useState(
      "AI model not loaded"
    );

  const [progress, setProgress] =
    useState(0);

  const [
    generating,
    setGenerating,
  ] = useState(false);

  const [
    modelLoaded,
    setModelLoaded,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [
    savingAsset,
    setSavingAsset,
  ] = useState(false);

  const [
    saveMessage,
    setSaveMessage,
  ] = useState("");

  const [
    saveError,
    setSaveError,
  ] = useState("");

  useEffect(() => {
    async function loadProject() {
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
        error:
          projectError,
      } =
        await supabase
          .from("projects")
          .select(`
            id,
            owner_id,
            title,
            description,
            genre,
            animation_style,
            target_audience,
            status
          `)
          .eq(
            "slug",
            slug
          )
          .maybeSingle();

      if (
        projectError ||
        !data
      ) {
        setError(
          "Project not found or you do not have access."
        );

        setLoadingProject(
          false
        );

        return;
      }

      setProject(
        data as Project
      );

      setLoadingProject(
        false
      );
    }

    void loadProject();
  }, [
    router,
    slug,
  ]);

  function getSelectedModel() {
    return aiMode ===
      "quality"
      ? QUALITY_MODEL
      : FAST_MODEL;
  }

  async function loadAI() {
    const modelId =
      getSelectedModel();

    if (
      engineRef.current &&
      loadedModelRef.current ===
        modelId
    ) {
      return engineRef.current;
    }

    if (
      !window.isSecureContext
    ) {
      throw new Error(
        "AnimForge AI requires a secure browser connection."
      );
    }

    if (
      !("gpu" in navigator)
    ) {
      throw new Error(
        "WebGPU is unavailable in this browser."
      );
    }

    const gpu =
      (navigator as any).gpu;

    setStatus(
      "Checking GPU..."
    );

    const adapter =
      await gpu.requestAdapter();

    if (!adapter) {
      throw new Error(
        "No WebGPU adapter could be created."
      );
    }

    const webllm =
      await import(
        "@mlc-ai/web-llm"
      );

    const exists =
      webllm.prebuiltAppConfig.model_list.some(
        (item: any) =>
          item.model_id ===
          modelId
      );

    if (!exists) {
      throw new Error(
        `AI model unavailable: ${modelId}`
      );
    }

    if (
      engineRef.current &&
      loadedModelRef.current !==
        modelId
    ) {
      try {
        await engineRef.current.unload();
      } catch {
        // Continue safely.
      }

      engineRef.current =
        null;

      loadedModelRef.current =
        null;
    }

    setModelLoaded(false);
    setProgress(0);

    setStatus(
      aiMode === "quality"
        ? "Loading Quality AI..."
        : "Loading Fast AI..."
    );

    const engine =
      await webllm.CreateMLCEngine(
        modelId,
        {
          initProgressCallback:
            (report: any) => {
              const percentage =
                Math.round(
                  (
                    report.progress ||
                    0
                  ) * 100
                );

              setProgress(
                Math.max(
                  0,
                  Math.min(
                    100,
                    percentage
                  )
                )
              );

              setStatus(
                report.text ||
                  `Loading AI ${percentage}%`
              );
            },

          logLevel:
            "INFO",
        }
      );

    engineRef.current =
      engine;

    loadedModelRef.current =
      modelId;

    setProgress(100);
    setModelLoaded(true);

    setStatus(
      aiMode === "quality"
        ? "Quality AI ready"
        : "Fast AI ready"
    );

    return engine;
  }

  function getProjectContext() {
    if (!project) {
      return "";
    }

    const blueprint =
      (
        project.description ||
        "No existing blueprint."
      ).slice(
        0,
        7000
      );

    return `
PROJECT TITLE:
${project.title}

GENRE:
${project.genre || "Not specified"}

ANIMATION STYLE:
${project.animation_style || "Not specified"}

TARGET AUDIENCE:
${project.target_audience || "Not specified"}

EXISTING PROJECT MATERIAL:
${blueprint}
`;
  }

  function getStoryInstruction() {
    const instructions: Record<
      StoryMode,
      string
    > = {
      continue:
        "Continue the story naturally from the existing material.",

      scene:
        "Write or improve a specific scene with setting, action, character behavior and dialogue.",

      dialogue:
        "Improve dialogue and make every character sound distinct and natural.",

      pacing:
        "Analyze and improve story pacing. Strengthen slow, rushed or repetitive moments.",

      conflict:
        "Strengthen conflict, obstacles, stakes and meaningful character choices.",

      ending:
        "Develop a satisfying ending that follows naturally from the story and characters.",

      rewrite:
        "Rewrite the requested material while preserving continuity and important established facts.",
    };

    return instructions[
      storyMode
    ];
  }

  function buildStoryPrompt() {
    return `
You are AnimForge Story Studio.

You are an expert animation story-development assistant working with human creators.

Avoid generic filler.
Avoid predictable clichés.
Preserve established continuity.

PROJECT CONTEXT:

${getProjectContext()}

STORY TOOL:
${storyMode.toUpperCase()}

TASK:
${getStoryInstruction()}

CREATOR REQUEST:
${
  instruction.trim() ||
  "Develop this part of the project creatively."
}

OUTPUT:

CREATIVE DIRECTION

STORY DEVELOPMENT

SCENE / BEAT BREAKDOWN

CHARACTER ACTIONS

DIALOGUE IDEAS

EMOTIONAL PURPOSE

CONTINUITY CHECK

WHAT COULD BE STRONGER

NEXT CREATIVE OPTIONS

Make the answer specific to this project.

The result is an editable creative draft.
`;
  }

  function buildCharacterPrompt() {
    return `
You are AnimForge Character Studio.

Help animation creators develop memorable, internally consistent original characters.

Avoid generic characters.
Give them strengths, weaknesses and contradictions.

PROJECT CONTEXT:

${getProjectContext()}

CREATOR INPUT:

NAME:
${characterName || "Create one"}

ROLE:
${characterRole || "Determine from project"}

AGE / PROFILE:
${characterAge || "Determine appropriately"}

PERSONALITY:
${personality || "Develop an interesting personality"}

MAIN GOAL:
${characterGoal || "Develop from story"}

FLAW:
${characterFlaw || "Create a meaningful flaw"}

VISUAL DIRECTION:
${visualDirection || "Develop from animation style"}

RELATIONSHIP:
${relationship || "Determine important relationships"}

EXTRA REQUEST:
${instruction || "None"}

OUTPUT:

CHARACTER NAME

CORE CONCEPT

ROLE IN THE STORY

PERSONALITY

INNER CONTRADICTION

GOAL

MOTIVATION

FEAR

FLAW

STRENGTHS

BACKSTORY

VISUAL DESIGN

SILHOUETTE / SHAPE LANGUAGE

CLOTHING / PROPS

FACIAL / BODY EXPRESSIONS

VOICE / SPEAKING STYLE

RELATIONSHIPS

CHARACTER ARC

KEY STORY MOMENTS

ANIMATION NOTES

3 DETAILS THAT MAKE THEM MEMORABLE
`;
  }

  async function runPrompt(
    prompt: string,
    successMessage: string
  ) {
    if (
      !project ||
      generating
    ) {
      return;
    }

    setGenerating(true);
    setError("");
    setSaveError("");
    setSaveMessage("");
    setResult("");

    try {
      const engine =
        await loadAI();

      setStatus(
        "Creating..."
      );

      const stream =
        await engine.chat.completions.create(
          {
            messages: [
              {
                role: "user",
                content:
                  prompt,
              },
            ],

            temperature:
              aiMode ===
              "quality"
                ? 0.72
                : 0.68,

            max_tokens:
              aiMode ===
              "quality"
                ? 950
                : 650,

            stream: true,
          }
        );

      let fullText = "";

      for await (
        const chunk of stream
      ) {
        const token =
          chunk
            .choices?.[0]
            ?.delta
            ?.content ||
          "";

        fullText += token;

        setResult(
          fullText
        );
      }

      if (!fullText.trim()) {
        throw new Error(
          "AI returned an empty response."
        );
      }

      setStatus(
        successMessage
      );
    } catch (err) {
      console.error(
        "PROJECT AI ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : String(err)
      );

      setStatus(
        "AI generation failed"
      );
    } finally {
      setGenerating(false);
    }
  }

  async function generate() {
    const prompt =
      toolMode === "story"
        ? buildStoryPrompt()
        : buildCharacterPrompt();

    await runPrompt(
      prompt,
      "Draft ready — edit anything you want"
    );
  }

  async function refine(
    refinement:
      | "expand"
      | "emotional"
      | "less_cliche"
      | "shorten"
      | "alternatives"
  ) {
    if (!result.trim()) {
      return;
    }

    const instructions = {
      expand:
        "Expand this draft with more useful creative detail while preserving the strongest ideas.",

      emotional:
        "Make this more emotional and character-driven without becoming melodramatic.",

      less_cliche:
        "Remove predictable ideas and replace them with fresher, more specific creative choices.",

      shorten:
        "Make this significantly more concise while keeping the strongest ideas.",

      alternatives:
        "Create THREE clearly different alternative versions. Label VERSION 1, VERSION 2 and VERSION 3.",
    };

    const prompt = `
You are AnimForge Creative Refinement AI.

PROJECT CONTEXT:

${getProjectContext()}

CURRENT DRAFT:

${result.slice(0, 9000)}

REFINEMENT:

${instructions[refinement]}

Return only the improved creative material.
`;

    await runPrompt(
      prompt,
      "Refinement ready"
    );
  }

  async function saveAsset() {
    if (
      !project ||
      !result.trim() ||
      savingAsset
    ) {
      return;
    }

    setSavingAsset(true);
    setSaveError("");
    setSaveMessage("");

    try {
      const supabase =
        createClient();

      const {
        data: { user },
        error:
          userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        router.push(
          "/auth/login"
        );

        return;
      }

      if (
        toolMode ===
        "story"
      ) {
        const {
          error:
            insertError,
        } =
          await supabase
            .from(
              "project_story_drafts"
            )
            .insert({
              project_id:
                project.id,

              created_by:
                user.id,

              title:
                createStoryTitle(
                  storyMode
                ),

              draft_type:
                storyMode,

              content:
                result.trim(),
            });

        if (insertError) {
          throw insertError;
        }

        setSaveMessage(
          "Story draft saved to this project ✓"
        );
      } else {
        const name =
          characterName.trim() ||
          extractCharacterName(
            result
          ) ||
          "Untitled Character";

        const {
          error:
            insertError,
        } =
          await supabase
            .from(
              "project_characters"
            )
            .insert({
              project_id:
                project.id,

              created_by:
                user.id,

              name,

              role:
                characterRole.trim() ||
                null,

              age_profile:
                characterAge.trim() ||
                null,

              personality:
                personality.trim() ||
                null,

              goal:
                characterGoal.trim() ||
                null,

              flaw:
                characterFlaw.trim() ||
                null,

              visual_direction:
                visualDirection.trim() ||
                null,

              relationship:
                relationship.trim() ||
                null,

              raw_content:
                result.trim(),
            });

        if (insertError) {
          throw insertError;
        }

        setSaveMessage(
          `${name} saved to this project ✓`
        );
      }
    } catch (err) {
      console.error(
        "SAVE AI ASSET ERROR:",
        err
      );

      setSaveError(
        err instanceof Error
          ? err.message
          : "Could not save this asset."
      );
    } finally {
      setSavingAsset(false);
    }
  }

  async function copyResult() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(
      result
    );

    setCopied(true);

    setTimeout(
      () =>
        setCopied(false),
      1500
    );
  }

  if (loadingProject) {
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

        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <a
            href={`/projects/${slug}`}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            Back to Project
          </a>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[1500px] px-6 pb-24 pt-10">

        {project && (
          <>
            <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.04] p-8 md:p-12">

              <div className="absolute right-[-120px] top-[-150px] h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-[140px]" />

              <div className="relative">

                <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">

                  <BrainCircuit
                    size={16}
                  />

                  AnimForge Creative AI

                </div>

                <h1 className="mt-6 text-4xl font-black md:text-6xl">
                  {project.title}
                </h1>

                <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
                  Develop and permanently save stories and characters inside your production.
                </p>

              </div>

            </div>

            {/* AI MODE */}

            <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-center gap-3">

                  <Gauge
                    size={19}
                    className="text-violet-400"
                  />

                  <div>

                    <p className="font-semibold">
                      AI Quality
                    </p>

                    <p className="text-xs text-zinc-600">
                      Fast for speed. Quality for stronger output.
                    </p>

                  </div>

                </div>

                <div className="grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    disabled={
                      generating
                    }
                    onClick={() => {
                      setAIMode(
                        "fast"
                      );

                      setModelLoaded(
                        loadedModelRef.current ===
                          FAST_MODEL
                      );
                    }}
                    className={`rounded-xl px-5 py-3 text-sm font-semibold ${
                      aiMode ===
                      "fast"
                        ? "bg-white text-black"
                        : "border border-white/10 text-zinc-400"
                    }`}
                  >
                    ⚡ Fast
                  </button>

                  <button
                    type="button"
                    disabled={
                      generating
                    }
                    onClick={() => {
                      setAIMode(
                        "quality"
                      );

                      setModelLoaded(
                        loadedModelRef.current ===
                          QUALITY_MODEL
                      );
                    }}
                    className={`rounded-xl px-5 py-3 text-sm font-semibold ${
                      aiMode ===
                      "quality"
                        ? "bg-violet-500 text-white"
                        : "border border-white/10 text-zinc-400"
                    }`}
                  >
                    ✨ Quality
                  </button>

                </div>

              </div>

            </section>

            {/* TOOLS */}

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              <ToolButton
                active={
                  toolMode ===
                  "story"
                }
                icon={
                  <BookOpen
                    size={22}
                  />
                }
                title="Story Studio"
                description="Scenes, dialogue, conflict, pacing and endings."
                onClick={() => {
                  setToolMode(
                    "story"
                  );

                  setResult("");
                  setError("");
                  setSaveError("");
                  setSaveMessage("");
                }}
              />

              <ToolButton
                active={
                  toolMode ===
                  "character"
                }
                icon={
                  <UserRound
                    size={22}
                  />
                }
                title="Character Studio"
                description="Personality, design, relationships and character arcs."
                onClick={() => {
                  setToolMode(
                    "character"
                  );

                  setResult("");
                  setError("");
                  setSaveError("");
                  setSaveMessage("");
                }}
              />

            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">

              {/* CONTROLS */}

              <section className="rounded-[32px] border border-white/10 bg-white/[0.035] p-7 md:p-9">

                {toolMode ===
                "story" ? (
                  <StoryControls
                    storyMode={
                      storyMode
                    }
                    setStoryMode={
                      setStoryMode
                    }
                    instruction={
                      instruction
                    }
                    setInstruction={
                      setInstruction
                    }
                  />
                ) : (
                  <CharacterControls
                    characterName={
                      characterName
                    }
                    setCharacterName={
                      setCharacterName
                    }
                    characterRole={
                      characterRole
                    }
                    setCharacterRole={
                      setCharacterRole
                    }
                    characterAge={
                      characterAge
                    }
                    setCharacterAge={
                      setCharacterAge
                    }
                    personality={
                      personality
                    }
                    setPersonality={
                      setPersonality
                    }
                    characterGoal={
                      characterGoal
                    }
                    setCharacterGoal={
                      setCharacterGoal
                    }
                    characterFlaw={
                      characterFlaw
                    }
                    setCharacterFlaw={
                      setCharacterFlaw
                    }
                    visualDirection={
                      visualDirection
                    }
                    setVisualDirection={
                      setVisualDirection
                    }
                    relationship={
                      relationship
                    }
                    setRelationship={
                      setRelationship
                    }
                    instruction={
                      instruction
                    }
                    setInstruction={
                      setInstruction
                    }
                  />
                )}

                {error && (
                  <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <div className="mt-7 border-t border-white/[0.07] pt-6">

                  <div className="flex items-center gap-2 text-sm text-zinc-500">

                    <Cpu
                      size={15}
                    />

                    {status}

                  </div>

                  {progress > 0 &&
                    !modelLoaded && (
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">

                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{
                            width:
                              `${progress}%`,
                          }}
                        />

                      </div>
                    )}

                  <button
                    type="button"
                    onClick={
                      generate
                    }
                    disabled={
                      generating
                    }
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-black disabled:opacity-40"
                  >

                    {generating ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <WandSparkles
                        size={18}
                      />
                    )}

                    {generating
                      ? "Creating..."
                      : toolMode ===
                        "story"
                      ? "Develop Story"
                      : "Build Character"}

                  </button>

                </div>

              </section>

              {/* RESULT */}

              <section className="rounded-[32px] border border-white/10 bg-white/[0.035] p-7 md:p-9">

                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-400">
                      Creative Draft
                    </p>

                    <h2 className="mt-2 text-3xl font-black">
                      {toolMode ===
                      "story"
                        ? "Story Development"
                        : "Character Design"}
                    </h2>

                  </div>

                  {result && (
                    <button
                      type="button"
                      onClick={
                        copyResult
                      }
                      className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400"
                    >

                      {copied ? (
                        <Check
                          size={15}
                        />
                      ) : (
                        <Copy
                          size={15}
                        />
                      )}

                      {copied
                        ? "Copied"
                        : "Copy"}

                    </button>
                  )}

                </div>

                {result ? (
                  <>

                    <div className="mt-6">

                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                        Refine
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">

                        <RefineButton
                          text="Expand"
                          disabled={
                            generating
                          }
                          onClick={() =>
                            refine(
                              "expand"
                            )
                          }
                        />

                        <RefineButton
                          text="More Emotional"
                          disabled={
                            generating
                          }
                          onClick={() =>
                            refine(
                              "emotional"
                            )
                          }
                        />

                        <RefineButton
                          text="Less Cliché"
                          disabled={
                            generating
                          }
                          onClick={() =>
                            refine(
                              "less_cliche"
                            )
                          }
                        />

                        <RefineButton
                          text="Shorten"
                          disabled={
                            generating
                          }
                          onClick={() =>
                            refine(
                              "shorten"
                            )
                          }
                        />

                        <RefineButton
                          text="3 Alternatives"
                          disabled={
                            generating
                          }
                          onClick={() =>
                            refine(
                              "alternatives"
                            )
                          }
                        />

                      </div>

                    </div>

                    <div className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/[0.06] p-4 text-sm text-violet-300">
                      ✦ Edit the draft below before saving.
                    </div>

                    <textarea
                      value={
                        result
                      }
                      onChange={(e) => {
                        setResult(
                          e.target.value
                        );

                        setSaveMessage("");
                      }}
                      rows={28}
                      className="mt-5 w-full resize-y rounded-[24px] border border-white/10 bg-black/25 p-6 leading-8 text-zinc-200 outline-none focus:border-violet-500/30"
                    />

                    {saveError && (
                      <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                        {saveError}
                      </div>
                    )}

                    {saveMessage && (
                      <div className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm font-medium text-green-300">
                        {saveMessage}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={
                        saveAsset
                      }
                      disabled={
                        savingAsset ||
                        generating
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-6 py-4 font-bold text-white transition hover:bg-violet-400 disabled:opacity-40"
                    >

                      {savingAsset ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Save
                          size={18}
                        />
                      )}

                      {savingAsset
                        ? "Saving..."
                        : toolMode ===
                          "story"
                        ? "Save Story Draft"
                        : "Save Character"}

                    </button>

                  </>
                ) : (
                  <div className="mt-8 flex min-h-[620px] items-center justify-center rounded-[26px] border border-dashed border-white/10 bg-black/10 p-10 text-center">

                    <div>

                      <BrainCircuit
                        size={40}
                        className="mx-auto text-violet-500"
                      />

                      <p className="mt-5 text-zinc-600">
                        Your AI draft will appear here.
                      </p>

                    </div>

                  </div>
                )}

              </section>

            </div>
          </>
        )}

      </section>

    </main>
  );
}

function StoryControls({
  storyMode,
  setStoryMode,
  instruction,
  setInstruction,
}: {
  storyMode: StoryMode;

  setStoryMode:
    (
      value: StoryMode
    ) => void;

  instruction: string;

  setInstruction:
    (
      value: string
    ) => void;
}) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
        Story Studio
      </p>

      <h2 className="mt-2 text-2xl font-black">
        What should we develop?
      </h2>

      <label className="mb-2 mt-6 block text-sm text-zinc-400">
        Story Tool
      </label>

      <select
        value={
          storyMode
        }
        onChange={(e) =>
          setStoryMode(
            e.target
              .value as StoryMode
          )
        }
        className={
          selectStyle
        }
      >
        <option value="continue">
          Continue Story
        </option>

        <option value="scene">
          Write / Improve Scene
        </option>

        <option value="dialogue">
          Improve Dialogue
        </option>

        <option value="pacing">
          Fix Pacing
        </option>

        <option value="conflict">
          Strengthen Conflict
        </option>

        <option value="ending">
          Create Ending
        </option>

        <option value="rewrite">
          Rewrite Material
        </option>
      </select>

      <label className="mb-2 mt-5 block text-sm text-zinc-400">
        Your Direction
      </label>

      <textarea
        value={
          instruction
        }
        onChange={(e) =>
          setInstruction(
            e.target.value
          )
        }
        rows={9}
        placeholder="Example: Rewrite Scene 3 with stronger tension and better dialogue."
        className={`${inputStyle} resize-none`}
      />
    </>
  );
}

function CharacterControls(
  props: any
) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-400">
        Character Studio
      </p>

      <h2 className="mt-2 text-2xl font-black">
        Build the character.
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">

        <MiniInput
          label="Name"
          value={
            props.characterName
          }
          setValue={
            props.setCharacterName
          }
          placeholder="Optional"
        />

        <MiniInput
          label="Story Role"
          value={
            props.characterRole
          }
          setValue={
            props.setCharacterRole
          }
          placeholder="Hero, rival..."
        />

        <MiniInput
          label="Age / Profile"
          value={
            props.characterAge
          }
          setValue={
            props.setCharacterAge
          }
          placeholder="16, elderly..."
        />

        <MiniInput
          label="Personality"
          value={
            props.personality
          }
          setValue={
            props.setPersonality
          }
          placeholder="Quiet but curious..."
        />

        <MiniInput
          label="Goal"
          value={
            props.characterGoal
          }
          setValue={
            props.setCharacterGoal
          }
          placeholder="What do they want?"
        />

        <MiniInput
          label="Flaw"
          value={
            props.characterFlaw
          }
          setValue={
            props.setCharacterFlaw
          }
          placeholder="Pride, fear..."
        />

      </div>

      <MiniInput
        label="Visual Direction"
        value={
          props.visualDirection
        }
        setValue={
          props.setVisualDirection
        }
        placeholder="Oversized coat, mechanical arm..."
        className="mt-4"
      />

      <MiniInput
        label="Important Relationship"
        value={
          props.relationship
        }
        setValue={
          props.setRelationship
        }
        placeholder="Rival of protagonist..."
        className="mt-4"
      />

      <label className="mb-2 mt-4 block text-sm text-zinc-400">
        Extra Direction
      </label>

      <textarea
        value={
          props.instruction
        }
        onChange={(e) =>
          props.setInstruction(
            e.target.value
          )
        }
        rows={5}
        placeholder="Anything else the AI should follow..."
        className={`${inputStyle} resize-none`}
      />
    </>
  );
}

function MiniInput({
  label,
  value,
  setValue,
  placeholder,
  className = "",
}: {
  label: string;

  value: string;

  setValue:
    (
      value: string
    ) => void;

  placeholder: string;

  className?: string;
}) {
  return (
    <div
      className={
        className
      }
    >
      <label className="mb-2 block text-sm text-zinc-400">
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          setValue(
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
    </div>
  );
}

function ToolButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;

  icon:
    React.ReactNode;

  title: string;

  description:
    string;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-[26px] border p-6 text-left transition ${
        active
          ? "border-violet-500/30 bg-violet-500/10"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >

      <div
        className={
          active
            ? "text-violet-300"
            : "text-zinc-500"
        }
      >
        {icon}
      </div>

      <h3 className="mt-4 text-xl font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {description}
      </p>

    </button>
  );
}

function RefineButton({
  text,
  disabled,
  onClick,
}: {
  text: string;

  disabled:
    boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      disabled={
        disabled
      }
      onClick={
        onClick
      }
      className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-400 transition hover:text-violet-300 disabled:opacity-40"
    >
      <Sparkles
        size={12}
        className="mr-1.5 inline"
      />

      {text}
    </button>
  );
}

function createStoryTitle(
  mode: StoryMode
) {
  const names: Record<
    StoryMode,
    string
  > = {
    continue:
      "Story Continuation",

    scene:
      "Scene Draft",

    dialogue:
      "Dialogue Draft",

    pacing:
      "Pacing Revision",

    conflict:
      "Conflict Development",

    ending:
      "Ending Draft",

    rewrite:
      "Story Rewrite",
  };

  const date =
    new Date()
      .toLocaleDateString();

  return `${names[mode]} — ${date}`;
}

function extractCharacterName(
  text: string
) {
  const lines =
    text
      .split("\n")
      .map(
        (line) =>
          line.trim()
      )
      .filter(Boolean);

  for (
    let i = 0;
    i < lines.length;
    i++
  ) {
    if (
      lines[i]
        .toUpperCase()
        .includes(
          "CHARACTER NAME"
        )
    ) {
      const sameLine =
        lines[i]
          .replace(
            /character name/gi,
            ""
          )
          .replace(
            /^[:\s#*-]+/,
            ""
          )
          .trim();

      if (sameLine) {
        return sameLine;
      }

      if (
        lines[i + 1]
      ) {
        return lines[
          i + 1
        ]
          .replace(
            /^[:\s#*-]+/,
            ""
          )
          .trim();
      }
    }
  }

  return "";
}
