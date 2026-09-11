"use client";

import type { MLCEngineInterface } from "@mlc-ai/web-llm";

import {
  ArrowLeft,
  BrainCircuit,
  Check,
  Copy,
  Cpu,
  FolderPlus,
  Loader2,
  Pencil,
  Save,
  Sparkles,
} from "lucide-react";

import {
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
    useRef<MLCEngineInterface | null>(null);

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

  const [
    editableResult,
    setEditableResult,
  ] = useState("");

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [status, setStatus] =
    useState(
      "AI model not loaded"
    );

  const [progress, setProgress] =
    useState(0);

  const [generating, setGenerating] =
    useState(false);

  const [
    modelLoaded,
    setModelLoaded,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [
    creatingProject,
    setCreatingProject,
  ] = useState(false);

  const [
    projectError,
    setProjectError,
  ] = useState("");

  async function loadAI() {
    if (engineRef.current) {
      return engineRef.current;
    }

    if (!window.isSecureContext) {
      throw new Error(
        "AnimForge AI needs a secure connection."
      );
    }

    if (!("gpu" in navigator)) {
      throw new Error(
        "WebGPU is not available in this browser."
      );
    }

    const gpu =
      (navigator as Navigator & {
        gpu: { requestAdapter(): Promise<object | null> };
      }).gpu;

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

    setStatus(
      "Loading AnimForge AI..."
    );

    const webllm =
      await import(
        "@mlc-ai/web-llm"
      );

    const exists =
      webllm.prebuiltAppConfig.model_list.some(
        (model) =>
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
            (report) => {
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

          logLevel: "INFO",
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
    setEditableResult("");

    setIsEditing(false);

    try {
      const engine =
        await loadAI();

      setStatus(
        "Forging blueprint..."
      );

      const prompt = `
You are AnimForge AI Studio.

Help a human animation creator turn a rough idea into a useful production plan.

Use EXACTLY these headings:

TITLE

LOGLINE

STORY OUTLINE

CHARACTERS

SCENES

TEAM ROLES NEEDED

PRODUCTION TASKS

TITLE:
One short project title.

LOGLINE:
One or two sentences.

STORY OUTLINE:
Beginning
Middle
Ending

CHARACTERS:
Include important characters with:
Name
Role
Personality
Motivation

SCENES:
Number the scenes.

TEAM ROLES NEEDED:
Each role must be on a separate line.

PRODUCTION TASKS:
Give 6 to 12 actionable tasks.
Each task must be on a separate line.

Keep the response concise and practical.

IDEA:
${idea.trim()}

GENRE:
${genre}

DURATION:
${duration}

STYLE:
${style}

AUDIENCE:
${audience}

TONE:
${tone}
`;

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

            temperature: 0.7,

            max_tokens: 700,

            stream: true,
          }
        );

      let fullText = "";

      for await (
        const chunk of stream
      ) {
        const token =
          chunk.choices?.[0]
            ?.delta?.content ||
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

      setEditableResult(
        fullText
      );

      setStatus(
        "Blueprint ready"
      );
    } catch (err) {
      console.error(
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

  function startEditing() {
    setEditableResult(
      result
    );

    setIsEditing(true);
  }

  function saveEdits() {
    setResult(
      editableResult
    );

    setIsEditing(false);

    setStatus(
      "Blueprint edits saved"
    );
  }

  function cancelEditing() {
    setEditableResult(
      result
    );

    setIsEditing(false);
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
      } =
        await supabase.auth.getUser();

      if (!user) {
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
        error:
          projectInsertError,
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
          projectInsertError
            ?.message ||
            "Could not create project."
        );
      }

      const tasks =
        parsed.tasks.length
          ? parsed.tasks
          : [
              "Review story outline",
              "Finalize character designs",
              "Create storyboard",
              "Prepare backgrounds",
              "Assign production roles",
              "Begin animation",
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
          taskError
        );
      }

      if (
        parsed.roles.length
      ) {
        const openings =
          parsed.roles
            .slice(0, 10)
            .map(
              (role) => ({
                project_id:
                  project.id,

                role_title:
                  role,

                description:
                  `Join ${projectTitle} as ${role}.`,

                compensation_type:
                  "negotiable",

                location_type:
                  "remote",

                status:
                  "open",
              })
            );

        const {
          error:
            openingError,
        } =
          await supabase
            .from(
              "project_openings"
            )
            .insert(
              openings
            );

        if (openingError) {
          console.error(
            openingError
          );
        }
      }

      router.push(
        `/projects/${project.slug}`
      );
    } catch (err) {
      setProjectError(
        err instanceof Error
          ? err.message
          : String(err)
      );
    } finally {
      setCreatingProject(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      <nav className="relative z-20 border-b border-white/5 bg-black/20">

        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <a
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-zinc-400"
          >
            <ArrowLeft size={16} />

            Dashboard
          </a>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[1500px] px-6 py-12">

        <div className="rounded-[40px] border border-white/10 bg-white/[0.04] p-10">

          <BrainCircuit className="text-violet-400" />

          <h1 className="mt-6 text-5xl font-black">
            AnimForge AI Studio
          </h1>

          <p className="mt-4 text-zinc-400">
            Idea → Blueprint → Edit → Project → Team → Production.
          </p>

        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">

          {/* LEFT SIDE */}

          <section className="rounded-[32px] border border-white/10 bg-white/[0.035] p-8">

            <h2 className="text-2xl font-bold">
              Your Idea
            </h2>

            <textarea
              value={idea}
              onChange={(e) =>
                setIdea(
                  e.target.value
                )
              }
              rows={7}
              placeholder="Describe your animation idea..."
              className={`${inputStyle} mt-6 resize-none`}
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
                ]}
              />

              <SelectField
                label="Duration"
                value={duration}
                onChange={
                  setDuration
                }
                options={[
                  "1-5 minutes",
                  "5-10 minutes",
                  "10-20 minutes",
                  "Series",
                ]}
              />

              <SelectField
                label="Style"
                value={style}
                onChange={setStyle}
                options={[
                  "2D",
                  "3D",
                  "Anime",
                  "Stop Motion",
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
                ]}
              />

            </div>

            {error && (
              <div className="mt-5 rounded-xl bg-red-500/10 p-4 text-red-300">
                {error}
              </div>
            )}

            <div className="mt-7 flex items-center gap-2 text-sm text-zinc-500">

              <Cpu size={15} />

              {status}

            </div>

            {progress > 0 &&
              !modelLoaded && (
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">

                  <div
                    className="h-full bg-violet-500"
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
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-bold text-black disabled:opacity-50"
            >

              {generating ? (
                <Loader2
                  className="animate-spin"
                  size={18}
                />
              ) : (
                <Sparkles size={18} />
              )}

              {generating
                ? "Generating..."
                : "Generate Blueprint"}

            </button>

          </section>

          {/* RIGHT SIDE */}

          <section className="rounded-[32px] border border-white/10 bg-white/[0.035] p-8">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <h2 className="text-2xl font-bold">
                AI Blueprint
              </h2>

              {result &&
                !isEditing && (
                  <div className="flex gap-2">

                    <button
                      type="button"
                      onClick={
                        copyResult
                      }
                      className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm"
                    >
                      {copied ? (
                        <Check size={15} />
                      ) : (
                        <Copy size={15} />
                      )}

                      {copied
                        ? "Copied"
                        : "Copy"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        startEditing
                      }
                      className="flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2 text-sm font-bold text-white"
                    >
                      <Pencil size={15} />

                      EDIT BLUEPRINT
                    </button>

                  </div>
                )}

            </div>

            {!result ? (
              <div className="mt-8 flex min-h-[500px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-center text-zinc-600">
                Generate a blueprint first.
              </div>
            ) : isEditing ? (
              <>

                <div className="mt-6 rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 text-sm text-violet-300">
                  EDIT MODE — change the title, story, characters, roles or tasks below.
                </div>

                <textarea
                  value={
                    editableResult
                  }
                  onChange={(e) =>
                    setEditableResult(
                      e.target.value
                    )
                  }
                  rows={28}
                  className="mt-5 w-full resize-y rounded-2xl border border-violet-500/30 bg-black/30 p-6 leading-8 text-white outline-none"
                />

                <div className="mt-5 flex gap-3">

                  <button
                    type="button"
                    onClick={
                      saveEdits
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-4 font-bold text-black"
                  >
                    <Save size={17} />

                    SAVE EDITS
                  </button>

                  <button
                    type="button"
                    onClick={
                      cancelEditing
                    }
                    className="rounded-2xl border border-white/10 px-6 py-4"
                  >
                    Cancel
                  </button>

                </div>

              </>
            ) : (
              <>

                <div className="mt-6 whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/20 p-6 leading-8 text-zinc-300">
                  {result}
                </div>

                {projectError && (
                  <div className="mt-5 rounded-xl bg-red-500/10 p-4 text-red-300">
                    {projectError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={
                    createProject
                  }
                  disabled={
                    creatingProject
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-6 py-4 font-bold disabled:opacity-50"
                >

                  {creatingProject ? (
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />
                  ) : (
                    <FolderPlus size={18} />
                  )}

                  {creatingProject
                    ? "Creating..."
                    : "Create AnimForge Project"}

                </button>

              </>
            )}

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

function parseBlueprint(
  text: string
) {
  const upper =
    text.toUpperCase();

  const sections:
    Record<string, string> = {};

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

      let end =
        text.length;

      for (
        let i =
          index + 1;
        i <
        HEADINGS.length;
        i++
      ) {
        const next =
          upper.indexOf(
            HEADINGS[i],
            contentStart
          );

        if (next !== -1) {
          end = next;
          break;
        }
      }

      sections[heading] =
        text
          .slice(
            contentStart,
            end
          )
          .replace(
            /^[:\s#*-]+/,
            ""
          )
          .trim();
    }
  );

  const title =
    sections.TITLE
      ?.split("\n")[0]
      ?.trim() ||
    "AI Animation Project";

  const tasks =
    parseList(
      sections[
        "PRODUCTION TASKS"
      ] || ""
    );

  const roles =
    parseList(
      sections[
        "TEAM ROLES NEEDED"
      ] || ""
    )
      .map((role) =>
        role
          .split(
            /\s[-–—]\s/
          )[0]
          .split(":")[0]
          .trim()
      )
      .filter(
        (role) =>
          role.length >= 3 &&
          role.length <= 80
      );

  return {
    title,
    tasks,
    roles:
      Array.from(
        new Set(roles)
      ),
  };
}

function parseList(
  text: string
) {
  return text
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
        line.length >= 3 &&
        line.length <= 220
    );
}

function createSlug(
  title: string
) {
  const base =
    title
      .toLowerCase()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .trim()
      .replace(
        /\s+/g,
        "-"
      )
      .slice(0, 50) ||
    "ai-project";

  return `${base}-${Date.now().toString(36)}`;
}
