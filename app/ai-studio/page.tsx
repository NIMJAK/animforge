"use client";

import {
  ArrowLeft,
  BrainCircuit,
  Check,
  Copy,
  Cpu,
  FolderPlus,
  Loader2,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import {
  type ReactNode,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import {
  AnimForgeLogo,
  PageBackground,
  inputStyle,
  selectStyle,
} from "@/components/animforge/ui";

const MODEL_ID =
  "SmolLM2-360M-Instruct-q4f32_1-MLC";

const HEADINGS = [
  "TITLE",
  "LOGLINE",
  "STORY OUTLINE",
  "CHARACTERS",
  "SCENES",
  "TEAM ROLES NEEDED",
  "PRODUCTION TASKS",
];

export default function AIStudioPage() {
  const router = useRouter();

  const engineRef =
    useRef<any>(null);

  const [idea, setIdea] =
    useState("");

  const [genre, setGenre] =
    useState("Fantasy");

  const [duration, setDuration] =
    useState("5-10 minutes");

  const [style, setStyle] =
    useState("2D");

  const [audience, setAudience] =
    useState("General");

  const [tone, setTone] =
    useState("Adventurous");

  const [result, setResult] =
    useState("");

  const [status, setStatus] =
    useState(
      "AI model not loaded"
    );

  const [progress, setProgress] =
    useState(0);

  const [generating, setGenerating] =
    useState(false);

  const [modelLoaded, setModelLoaded] =
    useState(false);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [creatingProject, setCreatingProject] =
    useState(false);

  const [projectError, setProjectError] =
    useState("");

  async function loadAI() {
    if (engineRef.current) {
      return engineRef.current;
    }

    if (!window.isSecureContext) {
      throw new Error(
        "AnimForge AI needs a secure browser connection. Use http://127.0.0.1:3000/ai-studio or the HTTPS live website."
      );
    }

    if (!("gpu" in navigator)) {
      throw new Error(
        "WebGPU is not available in this browser."
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
        "WebGPU is enabled, but no GPU adapter could be created."
      );
    }

    setStatus(
      "Loading AnimForge AI..."
    );

    const webllm =
      await import(
        "@mlc-ai/web-llm"
      );

    const exists =
      webllm.prebuiltAppConfig.model_list.some(
        (model: any) =>
          model.model_id ===
          MODEL_ID
      );

    if (!exists) {
      throw new Error(
        `AI model unavailable: ${MODEL_ID}`
      );
    }

    setProgress(0);

    const engine =
      await webllm.CreateMLCEngine(
        MODEL_ID,
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
                  `Loading AI • ${percentage}%`
              );
            },

          logLevel:
            "INFO",
        }
      );

    engineRef.current =
      engine;

    setProgress(100);
    setModelLoaded(true);

    setStatus(
      "AnimForge AI ready"
    );

    return engine;
  }

  async function generate() {
    if (!idea.trim()) {
      setError(
        "Enter your animation idea first."
      );

      return;
    }

    if (generating) {
      return;
    }

    setGenerating(true);

    setError("");
    setProjectError("");
    setResult("");
    setCopied(false);

    try {
      const engine =
        await loadAI();

      setStatus(
        "Forging your animation world..."
      );

      const prompt = `
You are AnimForge AI Studio.

You are an animation pre-production co-creator.

Your job is to help human creators transform rough ideas into practical animation production plans.

The human creator always remains in control.

Use EXACTLY these headings:

TITLE

LOGLINE

STORY OUTLINE

CHARACTERS

SCENES

TEAM ROLES NEEDED

PRODUCTION TASKS

Rules:

TITLE:
Give one short working title.

LOGLINE:
Give one or two sentences.

STORY OUTLINE:
Include:
Beginning
Middle
Ending

CHARACTERS:
For each important character give:
Name
Role
Personality
Motivation

SCENES:
Create a numbered scene list appropriate for the requested duration.

TEAM ROLES NEEDED:
Recommend the creators required for this animation.

Examples may include:
Animator
Writer
Storyboard Artist
Character Artist
Background Artist
Voice Actor
Sound Designer
Video Editor

PRODUCTION TASKS:
Give 6 to 12 clear actionable production tasks.

Each task must be on a separate line.

Do not write long explanations.
Keep everything practical.

CREATOR IDEA:
${idea.trim()}

GENRE:
${genre}

DURATION:
${duration}

ANIMATION STYLE:
${style}

TARGET AUDIENCE:
${audience}

TONE:
${tone}

Create the AnimForge production blueprint now.
`;

      const stream =
        await engine.chat.completions.create(
          {
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],

            temperature: 0.7,

            max_tokens: 650,

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
          "The AI model returned an empty response."
        );
      }

      setStatus(
        "Blueprint ready"
      );
    } catch (err) {
      console.error(
        "ANIMFORGE AI ERROR:",
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

  async function createProject() {
    if (!result.trim()) {
      return;
    }

    setCreatingProject(true);
    setProjectError("");

    try {
      const supabase =
        createClient();

      const {
        data: { user },
        error: userError,
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

      const parsed =
        parseBlueprint(
          result
        );

      const projectTitle =
        parsed.title ||
        `${genre} Animation Project`;

      const slug =
        createSlug(
          projectTitle
        );

      const {
        data: project,
        error: projectInsertError,
      } =
        await supabase
          .from("projects")
          .insert({
            owner_id:
              user.id,

            title:
              projectTitle,

            slug,

            description:
              result,

            genre,

            animation_style:
              style,

            target_audience:
              audience,

            visibility:
              "private",

            status:
              "planning",
          })
          .select(
            "id, slug"
          )
          .single();

      if (
        projectInsertError ||
        !project
      ) {
        throw new Error(
          projectInsertError?.message ||
            "Could not create project."
        );
      }

      const tasks =
        parsed.tasks.length >
        0
          ? parsed.tasks
          : [
              "Review and refine the story outline",
              "Finalize main character designs",
              "Create storyboard",
              "Prepare background concepts",
              "Assign production roles",
              "Begin first animation pass",
            ];

      const taskRows =
        tasks
          .slice(0, 12)
          .map(
            (task) => ({
              project_id:
                project.id,

              title:
                task.slice(
                  0,
                  180
                ),

              description:
                "Suggested by AnimForge AI Studio.",

              status:
                "backlog",

              created_by:
                user.id,

              assigned_to:
                null,

              due_date:
                null,
            })
          );

      const {
        error: taskError,
      } =
        await supabase
          .from("tasks")
          .insert(
            taskRows
          );

      if (taskError) {
        console.error(
          "TASK CREATION ERROR:",
          taskError
        );

        setProjectError(
          "The project was created, but some AI tasks could not be added."
        );

        router.push(
          `/projects/${project.slug}`
        );

        return;
      }

      router.push(
        `/projects/${project.slug}/board`
      );
    } catch (err) {
      console.error(
        "CREATE PROJECT ERROR:",
        err
      );

      setProjectError(
        err instanceof Error
          ? err.message
          : String(err)
      );
    } finally {
      setCreatingProject(false);
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
      () => {
        setCopied(false);
      },
      1500
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5">

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

      <section className="relative z-10 mx-auto max-w-[1500px] px-6 pb-24 pt-12">

        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl md:p-12">

          <div className="absolute right-[-130px] top-[-150px] h-[450px] w-[450px] rounded-full bg-violet-500/20 blur-[140px]" />

          <div className="absolute bottom-[-200px] left-[20%] h-[400px] w-[400px] rounded-full bg-fuchsia-500/10 blur-[140px]" />

          <div className="relative max-w-4xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">

              <BrainCircuit
                size={16}
              />

              AnimForge AI Studio

            </div>

            <h1 className="mt-7 text-5xl font-black leading-[0.98] tracking-[-0.045em] md:text-7xl">

              Imagine it.
              <br />

              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Forge the production.
              </span>

            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">

              Turn a rough animation idea into
              a story foundation, characters,
              scenes, team roles and a working
              production board.

            </p>

            <div className="mt-7 flex flex-wrap gap-3">

              <FeatureBadge>
                Local AI
              </FeatureBadge>

              <FeatureBadge>
                No API key
              </FeatureBadge>

              <FeatureBadge>
                Free-first
              </FeatureBadge>

              <FeatureBadge>
                Human controlled
              </FeatureBadge>

            </div>

          </div>

        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">

          <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl md:p-9">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">

              <WandSparkles
                size={21}
              />

            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Your Spark
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Describe your world.
            </h2>

            <textarea
              value={idea}
              onChange={(e) =>
                setIdea(
                  e.target.value
                )
              }
              rows={7}
              placeholder="A boy living in a flooded future city discovers a tiny robot carrying a map to the last forest on Earth..."
              className={`${inputStyle} mt-8 resize-none`}
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">

              <SelectField
                label="Genre"
                value={genre}
                onChange={setGenre}
                options={[
                  "Fantasy",
                  "Adventure",
                  "Comedy",
                  "Drama",
                  "Sci-Fi",
                  "Horror",
                  "Action",
                  "Romance",
                  "Educational",
                ]}
              />

              <SelectField
                label="Duration"
                value={duration}
                onChange={
                  setDuration
                }
                options={[
                  "Under 1 minute",
                  "1-5 minutes",
                  "5-10 minutes",
                  "10-20 minutes",
                  "20+ minutes",
                  "Series",
                ]}
              />

              <SelectField
                label="Animation Style"
                value={style}
                onChange={setStyle}
                options={[
                  "2D",
                  "3D",
                  "Anime",
                  "Stop Motion",
                  "Motion Graphics",
                  "Mixed Media",
                ]}
              />

              <SelectField
                label="Audience"
                value={audience}
                onChange={
                  setAudience
                }
                options={[
                  "Kids",
                  "Teens",
                  "Young Adults",
                  "Adults",
                  "Family",
                  "General",
                ]}
              />

            </div>

            <div className="mt-4">

              <SelectField
                label="Tone"
                value={tone}
                onChange={setTone}
                options={[
                  "Adventurous",
                  "Funny",
                  "Emotional",
                  "Dark",
                  "Wholesome",
                  "Epic",
                  "Mysterious",
                  "Educational",
                ]}
              />

            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-200">
                {error}
              </div>
            )}

            <div className="mt-8 border-t border-white/[0.07] pt-6">

              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-2 text-sm text-zinc-500">

                  <Cpu
                    size={15}
                  />

                  {status}

                </div>

                {progress > 0 &&
                  !modelLoaded && (
                    <span className="text-xs text-violet-400">
                      {progress}%
                    </span>
                  )}

              </div>

              {progress > 0 &&
                !modelLoaded && (
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.05]">

                    <div
                      className="h-full rounded-full bg-violet-500 transition-all"
                      style={{
                        width:
                          `${progress}%`,
                      }}
                    />

                  </div>
                )}

              <button
                type="button"
                onClick={generate}
                disabled={generating}
                className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
              >

                {generating ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Sparkles
                    size={17}
                  />
                )}

                {generating
                  ? "Forging Blueprint..."
                  : result
                  ? "Regenerate Blueprint"
                  : "Generate Blueprint"}

              </button>

              {!modelLoaded && (
                <p className="mt-4 text-center text-xs leading-5 text-zinc-700">
                  First use loads the local AI
                  model. Later generations use
                  the browser cache.
                </p>
              )}

            </div>

          </section>

          <section className="rounded-[34px] border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl md:p-9">

            <div className="flex flex-wrap items-start justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-400">
                  AI Blueprint
                </p>

                <h2 className="mt-2 text-3xl font-black">
                  Creative Foundation
                </h2>

              </div>

              {result && (
                <button
                  type="button"
                  onClick={
                    copyResult
                  }
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 transition hover:text-white"
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
                <div className="mt-8 max-h-[760px] overflow-y-auto whitespace-pre-wrap rounded-[26px] border border-white/[0.07] bg-black/20 p-6 leading-8 text-zinc-300 md:p-8">
                  {result}
                </div>

                {projectError && (
                  <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                    {projectError}
                  </div>
                )}

                <div className="mt-6 rounded-[26px] border border-violet-500/20 bg-violet-500/[0.07] p-6">

                  <p className="text-sm font-semibold text-violet-300">
                    Ready to turn this into a real project?
                  </p>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    AnimForge will create the project
                    and turn the AI production tasks
                    into backlog tasks on your project
                    board.
                  </p>

                  <button
                    type="button"
                    onClick={
                      createProject
                    }
                    disabled={
                      creatingProject
                    }
                    className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-violet-500 px-6 py-4 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    {creatingProject ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <FolderPlus
                        size={17}
                      />
                    )}

                    {creatingProject
                      ? "Creating Project..."
                      : "Create AnimForge Project"}

                  </button>

                </div>
              </>
            ) : (
              <div className="mt-8 flex min-h-[560px] items-center justify-center rounded-[26px] border border-dashed border-white/10 bg-black/10 p-10">

                <div className="max-w-md text-center">

                  <BrainCircuit
                    size={40}
                    className="mx-auto text-violet-500"
                  />

                  <h3 className="mt-6 text-2xl font-bold">
                    Your world begins here.
                  </h3>

                  <p className="mt-4 leading-7 text-zinc-600">
                    Give AnimForge AI your rough
                    concept. Your generated story
                    and production blueprint will
                    appear here.
                  </p>

                </div>

              </div>
            )}

            <p className="mt-6 text-xs leading-6 text-zinc-700">
              AI output is a starting point.
              Human creators remain responsible
              for all final creative decisions.
            </p>

          </section>

        </div>

      </section>

    </main>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange:
    (value: string) => void;
  options: string[];
}) {
  return (
    <div>

      <label className="mb-2 block text-sm text-zinc-400">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className={selectStyle}
      >

        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}

      </select>

    </div>
  );
}

function FeatureBadge({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-zinc-400">
      {children}
    </span>
  );
}

function parseBlueprint(
  text: string
) {
  const upper =
    text.toUpperCase();

  const sections:
    Record<string, string> =
    {};

  HEADINGS.forEach(
    (heading, index) => {
      const start =
        upper.indexOf(
          heading
        );

      if (start === -1) {
        return;
      }

      const contentStart =
        start +
        heading.length;

      let contentEnd =
        text.length;

      for (
        let i =
          index + 1;
        i <
        HEADINGS.length;
        i++
      ) {
        const nextIndex =
          upper.indexOf(
            HEADINGS[i],
            contentStart
          );

        if (
          nextIndex !== -1
        ) {
          contentEnd =
            nextIndex;

          break;
        }
      }

      sections[heading] =
        text
          .slice(
            contentStart,
            contentEnd
          )
          .replace(
            /^[:\s-]+/,
            ""
          )
          .trim();
    }
  );

  const title =
    sections.TITLE
      ?.split("\n")[0]
      ?.replace(
        /^[#*:\-\s]+/,
        ""
      )
      .trim() || "";

  const taskSection =
    sections[
      "PRODUCTION TASKS"
    ] || "";

  const tasks =
    taskSection
      .split("\n")
      .map((line) =>
        line
          .replace(
            /^\s*(?:[-*•]|\d+[\.\)])\s*/,
            ""
          )
          .trim()
      )
      .filter(
        (line) =>
          line.length >= 4 &&
          line.length <= 220
      );

  return {
    title,
    tasks,
  };
}

function createSlug(
  title: string
) {
  const base =
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .trim()
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      )
      .slice(0, 50) ||
    "ai-project";

  return `${base}-${Date.now().toString(36)}`;
}
