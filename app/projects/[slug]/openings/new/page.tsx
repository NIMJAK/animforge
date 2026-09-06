"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Coins,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import {
  AnimForgeLogo,
  PageBackground,
  inputStyle,
  selectStyle,
} from "@/components/animforge/ui";

export default function NewOpeningPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const slug = decodeURIComponent(params.slug);

  const [projectId, setProjectId] = useState("");
  const [projectTitle, setProjectTitle] = useState("");

  const [roleTitle, setRoleTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");

  const [compensationType, setCompensationType] =
    useState("unpaid");

  const [compensationDetails, setCompensationDetails] =
    useState("");

  const [locationType, setLocationType] =
    useState("remote");

  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProject() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: project, error } =
        await supabase
          .from("projects")
          .select("id, title, owner_id")
          .eq("slug", slug)
          .maybeSingle();

      if (error || !project) {
        setMessage("Project not found.");
        setLoading(false);
        return;
      }

      if (project.owner_id !== user.id) {
        setMessage(
          "Only the project owner can create collaboration openings."
        );
        setLoading(false);
        return;
      }

      setProjectId(project.id);
      setProjectTitle(project.title);
      setLoading(false);
    }

    loadProject();
  }, [router, slug]);

  async function createOpening(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!roleTitle.trim()) {
      setMessage("Enter the role you need.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("project_openings")
      .insert({
        project_id: projectId,
        role_title: roleTitle.trim(),
        description: description.trim() || null,
        required_skills:
          requiredSkills.trim() || null,
        compensation_type:
          compensationType,
        compensation_details:
          compensationDetails.trim() || null,
        location_type: locationType,
        location:
          locationType === "remote"
            ? null
            : location.trim() || null,
        status: "open",
      });

    if (error) {
      console.error("OPENING ERROR:", error);
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    router.push(`/projects/${slug}`);
    router.refresh();
  }

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060608] text-white">
        <PageBackground />

        <div className="relative z-10 text-center">
          <BriefcaseBusiness
            size={30}
            className="mx-auto text-violet-400"
          />

          <p className="mt-4 text-zinc-500">
            Opening the collaboration studio...
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
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">
          <AnimForgeLogo />

          <a
            href={`/projects/${slug}`}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft size={16} />
            Project
          </a>
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid max-w-[1400px] gap-12 px-6 pb-24 pt-14 lg:grid-cols-[.72fr_1.28fr]">

        {/* LEFT */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            <Users size={15} />
            Build your crew
          </div>

          <h1 className="mt-8 text-5xl font-black leading-[1.02] tracking-[-0.04em] md:text-6xl">
            Find the skill
            <br />
            your world
            <br />

            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              is missing.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">
            Create a collaboration opening and let
            AnimForge creators know exactly how they
            can contribute to your project.
          </p>

          {/* PROJECT CARD */}
          <div className="mt-10 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] backdrop-blur-xl">
            <div className="relative h-32 bg-gradient-to-br from-violet-500/25 via-fuchsia-500/10 to-blue-500/10">
              <div className="absolute right-6 top-6">
                <Sparkles className="text-violet-300" />
              </div>
            </div>

            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                Recruiting For
              </p>

              <h2 className="mt-3 text-xl font-semibold">
                {projectTitle}
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                This role will appear on the project
                page and in AnimForge Discover.
              </p>
            </div>
          </div>
        </aside>

        {/* FORM */}
        <form
          onSubmit={createOpening}
          className="rounded-[34px] border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
            <BriefcaseBusiness size={21} />
          </div>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
            Collaboration Opening
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Who does your project need?
          </h2>

          <p className="mt-3 text-zinc-500">
            Be clear about the role, skills and
            collaboration terms.
          </p>

          {/* ROLE */}
          <div className="mt-9">
            <label className="mb-2 block text-sm text-zinc-400">
              Role needed
            </label>

            <input
              value={roleTitle}
              onChange={(e) =>
                setRoleTitle(e.target.value)
              }
              required
              placeholder="2D Animator"
              className={inputStyle}
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">
            <label className="mb-2 block text-sm text-zinc-400">
              What will they work on?
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={5}
              placeholder="Describe the role, responsibilities and the part of the project they'll help create..."
              className={`${inputStyle} resize-none`}
            />
          </div>

          {/* SKILLS */}
          <div className="mt-6">
            <label className="mb-2 block text-sm text-zinc-400">
              Useful skills
            </label>

            <input
              value={requiredSkills}
              onChange={(e) =>
                setRequiredSkills(e.target.value)
              }
              placeholder="2D animation, Krita, Toon Boom, character acting..."
              className={inputStyle}
            />
          </div>

          {/* COMPENSATION */}
          <section className="mt-9 rounded-[26px] border border-white/[0.08] bg-black/20 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
                <Coins size={18} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Collaboration terms
                </h3>

                <p className="mt-1 text-sm text-zinc-600">
                  Tell creators how this role is compensated.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Compensation
                </label>

                <select
                  value={compensationType}
                  onChange={(e) =>
                    setCompensationType(
                      e.target.value
                    )
                  }
                  className={selectStyle}
                >
                  <option value="unpaid">
                    Unpaid collaboration
                  </option>

                  <option value="fixed">
                    Fixed payment
                  </option>

                  <option value="hourly">
                    Hourly
                  </option>

                  <option value="revenue_share">
                    Revenue share
                  </option>

                  <option value="negotiable">
                    Negotiable
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Details
                </label>

                <input
                  value={compensationDetails}
                  onChange={(e) =>
                    setCompensationDetails(
                      e.target.value
                    )
                  }
                  placeholder="₹5,000, 10% revenue share..."
                  className={inputStyle}
                />
              </div>
            </div>
          </section>

          {/* LOCATION */}
          <section className="mt-6 rounded-[26px] border border-white/[0.08] bg-black/20 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <MapPin size={18} />
              </div>

              <div>
                <h3 className="font-semibold">
                  How will you work together?
                </h3>

                <p className="mt-1 text-sm text-zinc-600">
                  AnimForge is built for remote collaboration too.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Work type
                </label>

                <select
                  value={locationType}
                  onChange={(e) =>
                    setLocationType(
                      e.target.value
                    )
                  }
                  className={selectStyle}
                >
                  <option value="remote">
                    Remote
                  </option>

                  <option value="hybrid">
                    Hybrid
                  </option>

                  <option value="onsite">
                    On-site
                  </option>
                </select>
              </div>

              {locationType !== "remote" && (
                <div>
                  <label className="mb-2 block text-sm text-zinc-400">
                    Location
                  </label>

                  <input
                    value={location}
                    onChange={(e) =>
                      setLocation(
                        e.target.value
                      )
                    }
                    placeholder="Kota, Rajasthan"
                    className={inputStyle}
                  />
                </div>
              )}
            </div>
          </section>

          {message && (
            <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {message}
            </div>
          )}

          {/* ACTIONS */}
          <div className="mt-9 flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-7 sm:flex-row sm:items-center sm:justify-between">
            <a
              href={`/projects/${slug}`}
              className="text-center text-sm text-zinc-500 transition hover:text-white"
            >
              Cancel
            </a>

            <button
              type="submit"
              disabled={submitting || !projectId}
              className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting
                ? "Publishing opening..."
                : "Publish Opening"}

              {!submitting && (
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              )}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
