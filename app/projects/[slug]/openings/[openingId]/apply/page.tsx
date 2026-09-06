"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clapperboard,
  Sparkles,
  UserRound,
  WandSparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import {
  AnimForgeLogo,
  PageBackground,
  inputStyle,
} from "@/components/animforge/ui";

type Opening = {
  id: string;
  project_id: string;
  role_title: string;
  description: string | null;
  required_skills: string | null;
  compensation_type: string;
  compensation_details: string | null;
  location_type: string;
  location: string | null;
  status: string;
};

type Project = {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  genre: string | null;
  animation_style: string | null;
};

export default function ApplyPage() {
  const params = useParams<{
    slug: string;
    openingId: string;
  }>();

  const router = useRouter();

  const slug = decodeURIComponent(params.slug);
  const openingId = params.openingId;

  const [opening, setOpening] =
    useState<Opening | null>(null);

  const [project, setProject] =
    useState<Project | null>(null);

  const [messageText, setMessageText] =
    useState("");

  const [experience, setExperience] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [alreadyApplied, setAlreadyApplied] =
    useState(false);

  const [isOwner, setIsOwner] =
    useState(false);

  useEffect(() => {
    async function loadApplicationPage() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      // OPENING
      const {
        data: openingData,
        error: openingError,
      } = await supabase
        .from("project_openings")
        .select(`
          id,
          project_id,
          role_title,
          description,
          required_skills,
          compensation_type,
          compensation_details,
          location_type,
          location,
          status
        `)
        .eq("id", openingId)
        .maybeSingle();

      if (
        openingError ||
        !openingData
      ) {
        setMessage(
          "This collaboration opening could not be found."
        );
        setLoading(false);
        return;
      }

      setOpening(openingData);

      // PROJECT
      const {
        data: projectData,
        error: projectError,
      } = await supabase
        .from("projects")
        .select(`
          id,
          owner_id,
          title,
          slug,
          genre,
          animation_style
        `)
        .eq(
          "id",
          openingData.project_id
        )
        .maybeSingle();

      if (
        projectError ||
        !projectData
      ) {
        setMessage(
          "The project for this role could not be found."
        );
        setLoading(false);
        return;
      }

      setProject(projectData);

      if (
        projectData.owner_id ===
        user.id
      ) {
        setIsOwner(true);
        setLoading(false);
        return;
      }

      // CHECK EXISTING APPLICATION
      const {
        data: existingApplication,
      } = await supabase
        .from("applications")
        .select("id, status")
        .eq(
          "opening_id",
          openingId
        )
        .eq(
          "applicant_id",
          user.id
        )
        .maybeSingle();

      if (existingApplication) {
        setAlreadyApplied(true);
      }

      setLoading(false);
    }

    loadApplicationPage();
  }, [openingId, router]);

  async function submitApplication(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!opening || !project) {
      return;
    }

    if (!messageText.trim()) {
      setMessage(
        "Tell the project creator why you'd like to join."
      );
      return;
    }

    setSubmitting(true);
    setMessage("");

    const supabase =
      createClient();

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const {
      error,
    } = await supabase
      .from("applications")
      .insert({
        opening_id:
          opening.id,
        applicant_id:
          user.id,
        message:
          messageText.trim(),
        experience:
          experience.trim() ||
          null,
        status: "pending",
      });

    if (error) {
      console.error(
        "APPLICATION ERROR:",
        error
      );

      if (
        error.message
          .toLowerCase()
          .includes("duplicate")
      ) {
        setAlreadyApplied(true);
        setMessage(
          "You've already applied for this role."
        );
      } else {
        setMessage(
          error.message
        );
      }

      setSubmitting(false);
      return;
    }

    router.push(
      `/projects/${project.slug}`
    );

    router.refresh();
  }

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060608] text-white">

        <PageBackground />

        <div className="relative z-10 text-center">

          <WandSparkles
            size={31}
            className="mx-auto text-violet-400"
          />

          <p className="mt-5 text-zinc-500">
            Preparing your application...
          </p>

        </div>

      </main>
    );
  }

  if (!opening || !project) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060608] text-white">

        <PageBackground />

        <div className="relative z-10 max-w-lg px-6 text-center">

          <BriefcaseBusiness
            size={32}
            className="mx-auto text-violet-400"
          />

          <h1 className="mt-6 text-3xl font-black">
            Role unavailable.
          </h1>

          <p className="mt-4 text-zinc-500">
            {message ||
              "This collaboration role is no longer available."}
          </p>

          <a
            href={`/projects/${slug}`}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black"
          >
            <ArrowLeft size={16} />
            Back to Project
          </a>

        </div>

      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      {/* NAVBAR */}
      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <a
            href={`/projects/${project.slug}`}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft size={16} />
            Project
          </a>

        </div>

      </nav>

      <section className="relative z-10 mx-auto grid max-w-[1400px] gap-12 px-6 pb-24 pt-14 lg:grid-cols-[.72fr_1.28fr]">

        {/* ROLE INFO */}
        <aside className="lg:sticky lg:top-28 lg:self-start">

          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-300">
            <Sparkles size={15} />
            Creative Opportunity
          </div>

          <h1 className="mt-8 text-5xl font-black leading-[1.02] tracking-[-0.04em] md:text-6xl">
            Become part
            <br />
            of this
            <br />

            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              animation world.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">
            Introduce yourself to the project
            creator and show how your skills can
            help their vision move forward.
          </p>

          {/* ROLE CARD */}
          <div className="mt-10 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035] backdrop-blur-xl">

            <div className="relative h-36 bg-gradient-to-br from-violet-500/25 via-fuchsia-500/10 to-blue-500/10">

              <div className="absolute right-6 top-6">
                <Clapperboard className="text-violet-300" />
              </div>

              <div className="absolute bottom-5 left-5">
                <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-300">
                  Open Role
                </span>
              </div>

            </div>

            <div className="p-6">

              <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                {project.title}
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                {opening.role_title}
              </h2>

              {opening.description && (
                <p className="mt-4 leading-7 text-zinc-500">
                  {opening.description}
                </p>
              )}

              <div className="mt-6 space-y-4 border-t border-white/[0.07] pt-5">

                <RoleDetail
                  label="Skills"
                  value={
                    opening.required_skills ||
                    "Open to creators"
                  }
                />

                <RoleDetail
                  label="Compensation"
                  value={formatCompensation(
                    opening.compensation_type,
                    opening.compensation_details
                  )}
                />

                <RoleDetail
                  label="Work"
                  value={
                    opening.location
                      ? `${opening.location_type} • ${opening.location}`
                      : opening.location_type
                  }
                />

              </div>

            </div>

          </div>

        </aside>

        {/* FORM SIDE */}
        <div>

          {isOwner ? (
            <div className="rounded-[34px] border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-xl md:p-12">

              <UserRound
                size={30}
                className="mx-auto text-violet-400"
              />

              <h2 className="mt-6 text-3xl font-black">
                This is your project.
              </h2>

              <p className="mx-auto mt-4 max-w-lg leading-7 text-zinc-500">
                Project owners can't apply to
                their own collaboration openings.
              </p>

              <a
                href={`/projects/${project.slug}`}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black"
              >
                Return to Project
                <ArrowRight size={16} />
              </a>

            </div>
          ) : alreadyApplied ? (
            <div className="rounded-[34px] border border-green-500/20 bg-green-500/[0.05] p-8 text-center backdrop-blur-xl md:p-12">

              <CheckCircle2
                size={38}
                className="mx-auto text-green-400"
              />

              <h2 className="mt-6 text-3xl font-black">
                Application sent.
              </h2>

              <p className="mx-auto mt-4 max-w-lg leading-7 text-zinc-500">
                You've already applied for this
                role. The project creator can
                review your profile, portfolio
                and application.
              </p>

              <a
                href={`/projects/${project.slug}`}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black"
              >
                Return to Project
                <ArrowRight size={16} />
              </a>

            </div>
          ) : (
            <form
              onSubmit={submitApplication}
              className="rounded-[34px] border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-10"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
                <BriefcaseBusiness size={21} />
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
                Your Application
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Tell them why you're a fit.
              </h2>

              <p className="mt-3 max-w-xl leading-7 text-zinc-500">
                Keep it personal. Explain why the
                project interests you and what you
                can contribute.
              </p>

              {/* MESSAGE */}
              <div className="mt-9">

                <label className="mb-2 block text-sm text-zinc-400">
                  Message to the creator
                </label>

                <textarea
                  required
                  value={messageText}
                  onChange={(e) =>
                    setMessageText(
                      e.target.value
                    )
                  }
                  rows={7}
                  placeholder="Hi! I really like the idea behind this project. I'd love to help with..."
                  className={`${inputStyle} resize-none`}
                />

              </div>

              {/* EXPERIENCE */}
              <div className="mt-6">

                <label className="mb-2 block text-sm text-zinc-400">
                  Relevant experience
                </label>

                <textarea
                  value={experience}
                  onChange={(e) =>
                    setExperience(
                      e.target.value
                    )
                  }
                  rows={5}
                  placeholder="Tell them about your skills, past work, software you use or relevant experience..."
                  className={`${inputStyle} resize-none`}
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Your public AnimForge profile and
                  portfolio can also be viewed by
                  the project owner.
                </p>

              </div>

              {message && (
                <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                  {message}
                </div>
              )}

              <div className="mt-9 flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-7 sm:flex-row sm:items-center sm:justify-between">

                <a
                  href={`/projects/${project.slug}`}
                  className="text-center text-sm text-zinc-500 transition hover:text-white"
                >
                  Cancel
                </a>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    opening.status !== "open"
                  }
                  className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {submitting
                    ? "Sending application..."
                    : "Send Application"}

                  {!submitting && (
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  )}

                </button>

              </div>

            </form>
          )}

        </div>

      </section>

    </main>
  );
}

function RoleDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-700">
        {label}
      </p>

      <p className="mt-2 text-sm capitalize text-zinc-400">
        {value}
      </p>
    </div>
  );
}

function formatCompensation(
  type: string,
  details: string | null
) {
  const labels: Record<string, string> = {
    unpaid: "Unpaid collaboration",
    fixed: "Fixed payment",
    hourly: "Hourly",
    revenue_share: "Revenue share",
    negotiable: "Negotiable",
  };

  const label =
    labels[type] || type;

  return details
    ? `${label} • ${details}`
    : label;
}
