"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Clock3,
  ExternalLink,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";

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

type Opening = {
  id: string;
  role_title: string;
};

type Application = {
  id: string;
  opening_id: string;
  applicant_id: string;
  message: string | null;
  experience: string | null;
  status: string;
  created_at: string;
};

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  roles: string[] | null;
  avatar_url: string | null;
};

export default function ApplicationsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const slug = decodeURIComponent(params.slug);

  const [project, setProject] =
    useState<Project | null>(null);

  const [openings, setOpenings] =
    useState<Opening[]>([]);

  const [applications, setApplications] =
    useState<Application[]>([]);

  const [profiles, setProfiles] =
    useState<Profile[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [reviewingId, setReviewingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadApplications() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

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
          slug
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (
        projectError ||
        !projectData
      ) {
        setMessage(
          "Project could not be found."
        );
        setLoading(false);
        return;
      }

      if (
        projectData.owner_id !==
        user.id
      ) {
        setMessage(
          "Only the project owner can review applications."
        );
        setLoading(false);
        return;
      }

      setProject(projectData);

      // OPENINGS
      const {
        data: openingData,
        error: openingError,
      } = await supabase
        .from("project_openings")
        .select(`
          id,
          role_title
        `)
        .eq(
          "project_id",
          projectData.id
        );

      if (openingError) {
        console.error(
          "OPENING ERROR:",
          openingError
        );
      }

      const loadedOpenings =
        openingData || [];

      setOpenings(
        loadedOpenings
      );

      const openingIds =
        loadedOpenings.map(
          (opening) => opening.id
        );

      if (
        openingIds.length === 0
      ) {
        setApplications([]);
        setProfiles([]);
        setLoading(false);
        return;
      }

      // APPLICATIONS
      const {
        data: applicationData,
        error: applicationError,
      } = await supabase
        .from("applications")
        .select(`
          id,
          opening_id,
          applicant_id,
          message,
          experience,
          status,
          created_at
        `)
        .in(
          "opening_id",
          openingIds
        )
        .order("created_at", {
          ascending: false,
        });

      if (applicationError) {
        console.error(
          "APPLICATION ERROR:",
          applicationError
        );

        setMessage(
          applicationError.message
        );

        setLoading(false);
        return;
      }

      const loadedApplications =
        applicationData || [];

      setApplications(
        loadedApplications
      );

      // APPLICANT PROFILES
      const applicantIds = [
        ...new Set(
          loadedApplications.map(
            (application) =>
              application.applicant_id
          )
        ),
      ];

      if (
        applicantIds.length > 0
      ) {
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(`
            id,
            username,
            display_name,
            bio,
            roles,
            avatar_url
          `)
          .in(
            "id",
            applicantIds
          );

        if (profileError) {
          console.error(
            "PROFILE ERROR:",
            profileError
          );
        }

        setProfiles(
          profileData || []
        );
      }

      setLoading(false);
    }

    loadApplications();
  }, [router, slug]);

  async function reviewApplication(
    applicationId: string,
    decision:
      | "accepted"
      | "rejected"
  ) {
    setReviewingId(
      applicationId
    );

    setMessage("");

    const supabase =
      createClient();

    const {
      error,
    } = await supabase.rpc(
      "review_application",
      {
        p_application_id:
          applicationId,

        p_decision:
          decision,
      }
    );

    if (error) {
      console.error(
        "REVIEW ERROR:",
        error
      );

      setMessage(
        error.message
      );

      setReviewingId(null);
      return;
    }

    setApplications(
      (current) =>
        current.map(
          (application) =>
            application.id ===
            applicationId
              ? {
                  ...application,
                  status:
                    decision,
                }
              : application
        )
    );

    setMessage(
      decision === "accepted"
        ? "Creator accepted. They are now part of the project team."
        : "Application rejected."
    );

    setReviewingId(null);

    router.refresh();
  }

  const openingMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          Opening
        >();

      openings.forEach(
        (opening) => {
          map.set(
            opening.id,
            opening
          );
        }
      );

      return map;
    }, [openings]);

  const profileMap =
    useMemo(() => {
      const map =
        new Map<
          string,
          Profile
        >();

      profiles.forEach(
        (profile) => {
          map.set(
            profile.id,
            profile
          );
        }
      );

      return map;
    }, [profiles]);

  const pendingCount =
    applications.filter(
      (application) =>
        application.status ===
        "pending"
    ).length;

  const acceptedCount =
    applications.filter(
      (application) =>
        application.status ===
        "accepted"
    ).length;

  const rejectedCount =
    applications.filter(
      (application) =>
        application.status ===
        "rejected"
    ).length;

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060608] text-white">

        <PageBackground />

        <div className="relative z-10 text-center">

          <BriefcaseBusiness
            size={30}
            className="mx-auto text-violet-400"
          />

          <p className="mt-5 text-zinc-500">
            Gathering applications...
          </p>

        </div>

      </main>
    );
  }

  if (!project) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060608] text-white">

        <PageBackground />

        <div className="relative z-10 max-w-lg px-6 text-center">

          <BriefcaseBusiness
            size={32}
            className="mx-auto text-violet-400"
          />

          <h1 className="mt-6 text-3xl font-black">
            Applications unavailable.
          </h1>

          <p className="mt-4 text-zinc-500">
            {message}
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

      {/* NAV */}
      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <div className="flex items-center gap-2">

            <a
              href={`/projects/${project.slug}`}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              <ArrowLeft
                size={16}
              />

              Project
            </a>

            <a
              href={`/projects/${project.slug}/board`}
              className="hidden rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.07] sm:block"
            >
              Workspace
            </a>

          </div>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[1450px] px-6 pb-24 pt-14">

        {/* HERO */}
        <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl md:p-12">

          <div className="absolute right-[-130px] top-[-140px] h-[430px] w-[430px] rounded-full bg-violet-500/20 blur-[140px]" />

          <div className="absolute bottom-[-180px] left-[30%] h-[350px] w-[350px] rounded-full bg-fuchsia-500/10 blur-[130px]" />

          <div className="relative grid gap-9 lg:grid-cols-[1fr_.7fr] lg:items-end">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">

                <Users size={15} />

                Build the Crew

              </div>

              <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-5xl md:text-6xl">

                Find the creators
                <br />

                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  behind the vision.
                </span>

              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">

                Review people who want
                to join{" "}

                <span className="font-medium text-zinc-200">
                  {project.title}
                </span>

                . Explore their creative
                identity before building
                your team.

              </p>

            </div>

            <div className="grid grid-cols-3 gap-3">

              <ApplicationStat
                value={
                  pendingCount
                }
                label="Pending"
                icon={
                  <Clock3
                    size={17}
                  />
                }
              />

              <ApplicationStat
                value={
                  acceptedCount
                }
                label="Accepted"
                icon={
                  <Check
                    size={17}
                  />
                }
              />

              <ApplicationStat
                value={
                  rejectedCount
                }
                label="Rejected"
                icon={
                  <X
                    size={17}
                  />
                }
              />

            </div>

          </div>

        </div>

        {message && (
          <div className="mt-7 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-sm text-violet-200">
            {message}
          </div>
        )}

        {/* APPLICATION LIST */}
        <section className="mt-14">

          <div className="flex items-end justify-between gap-5">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-400">
                Talent Queue
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Applications
              </h2>

              <p className="mt-2 text-zinc-500">
                Review portfolios,
                experience and reasons
                for joining.
              </p>

            </div>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-500">
              {applications.length}{" "}
              {applications.length ===
              1
                ? "application"
                : "applications"}
            </span>

          </div>

          {applications.length >
          0 ? (

            <div className="mt-8 space-y-6">

              {applications.map(
                (application) => {
                  const opening =
                    openingMap.get(
                      application.opening_id
                    );

                  const profile =
                    profileMap.get(
                      application.applicant_id
                    );

                  const name =
                    profile?.display_name ||
                    profile?.username ||
                    "AnimForge Creator";

                  const reviewing =
                    reviewingId ===
                    application.id;

                  return (
                    <article
                      key={
                        application.id
                      }
                      className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] backdrop-blur-xl"
                    >

                      <div className="absolute right-[-90px] top-[-100px] h-64 w-64 rounded-full bg-violet-500/[0.07] blur-[90px]" />

                      <div className="relative grid lg:grid-cols-[.7fr_1.3fr]">

                        {/* CREATOR */}
                        <div className="border-b border-white/[0.07] p-7 lg:border-b-0 lg:border-r lg:p-8">

                          <div className="flex items-center gap-4">

                            {profile?.avatar_url ? (

                              <img
                                src={
                                  profile.avatar_url
                                }
                                alt={name}
                                className="h-16 w-16 rounded-2xl object-cover"
                              />

                            ) : (

                              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-2xl font-black text-violet-200">

                                {name
                                  .charAt(0)
                                  .toUpperCase()}

                              </div>

                            )}

                            <div className="min-w-0">

                              <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">
                                Applicant
                              </p>

                              <h3 className="mt-1 truncate text-xl font-bold">
                                {name}
                              </h3>

                              {profile?.username && (
                                <p className="mt-1 text-sm text-zinc-600">
                                  @
                                  {
                                    profile.username
                                  }
                                </p>
                              )}

                            </div>

                          </div>

                          {profile?.roles &&
                            profile.roles
                              .length >
                              0 && (

                              <div className="mt-6 flex flex-wrap gap-2">

                                {profile.roles
                                  .slice(
                                    0,
                                    4
                                  )
                                  .map(
                                    (
                                      role
                                    ) => (

                                      <span
                                        key={
                                          role
                                        }
                                        className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300"
                                      >
                                        {
                                          role
                                        }
                                      </span>

                                    )
                                  )}

                              </div>

                            )}

                          {profile?.bio && (

                            <p className="mt-5 line-clamp-4 leading-7 text-zinc-500">
                              {
                                profile.bio
                              }
                            </p>

                          )}

                          {profile?.username && (

                            <a
                              href={`/creators/${profile.username}`}
                              className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300 transition hover:border-violet-500/30 hover:bg-violet-500/[0.05]"
                            >

                              <span className="flex items-center gap-2">

                                <UserRound
                                  size={
                                    16
                                  }
                                />

                                View Profile
                                & Portfolio

                              </span>

                              <ExternalLink
                                size={
                                  14
                                }
                              />

                            </a>

                          )}

                        </div>

                        {/* APPLICATION */}
                        <div className="p-7 lg:p-8">

                          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                            <div>

                              <p className="text-xs uppercase tracking-[0.16em] text-zinc-600">
                                Applied For
                              </p>

                              <h3 className="mt-2 text-2xl font-bold">
                                {opening?.role_title ||
                                  "Collaboration Role"}
                              </h3>

                              <p className="mt-2 text-xs text-zinc-700">
                                Applied{" "}
                                {formatDate(
                                  application.created_at
                                )}
                              </p>

                            </div>

                            <StatusBadge
                              status={
                                application.status
                              }
                            />

                          </div>

                          {/* MESSAGE */}
                          <div className="mt-7 rounded-[24px] border border-white/[0.07] bg-black/20 p-6">

                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                              Why I Want
                              to Join
                            </p>

                            <p className="mt-4 whitespace-pre-wrap leading-8 text-zinc-400">
                              {application.message ||
                                "No message provided."}
                            </p>

                          </div>

                          {/* EXPERIENCE */}
                          <div className="mt-4 rounded-[24px] border border-white/[0.07] bg-black/20 p-6">

                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-400">
                              Experience
                              & Skills
                            </p>

                            <p className="mt-4 whitespace-pre-wrap leading-8 text-zinc-500">
                              {application.experience ||
                                "No additional experience information provided."}
                            </p>

                          </div>

                          {/* ACTIONS */}
                          <div className="mt-7 flex flex-col gap-3 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-end">

                            <button
                              type="button"
                              disabled={
                                reviewing ||
                                application.status ===
                                  "rejected"
                              }
                              onClick={() =>
                                reviewApplication(
                                  application.id,
                                  "rejected"
                                )
                              }
                              className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-5 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-35"
                            >

                              <X
                                size={
                                  16
                                }
                              />

                              {application.status ===
                              "rejected"
                                ? "Rejected"
                                : "Reject"}

                            </button>

                            <button
                              type="button"
                              disabled={
                                reviewing ||
                                application.status ===
                                  "accepted"
                              }
                              onClick={() =>
                                reviewApplication(
                                  application.id,
                                  "accepted"
                                )
                              }
                              className="group flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-35"
                            >

                              <Check
                                size={
                                  16
                                }
                              />

                              {reviewing
                                ? "Updating..."
                                : application.status ===
                                  "accepted"
                                ? "Accepted"
                                : "Accept Creator"}

                              {!reviewing &&
                                application.status !==
                                  "accepted" && (

                                  <ArrowRight
                                    size={
                                      15
                                    }
                                    className="transition group-hover:translate-x-1"
                                  />

                                )}

                            </button>

                          </div>

                          {application.status ===
                            "accepted" && (

                            <div className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/[0.06] p-4 text-sm text-green-300">

                              <div className="flex items-center gap-2">

                                <Check
                                  size={
                                    16
                                  }
                                />

                                This creator
                                is now part of
                                your project
                                team.

                              </div>

                            </div>

                          )}

                        </div>

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          ) : (

            <div className="mt-8 rounded-[32px] border border-dashed border-white/10 bg-white/[0.02] p-14 text-center">

              <Sparkles
                size={28}
                className="mx-auto text-violet-500"
              />

              <h3 className="mt-5 text-2xl font-semibold">
                No applications yet.
              </h3>

              <p className="mx-auto mt-3 max-w-lg leading-7 text-zinc-600">
                When creators apply
                to one of your open
                collaboration roles,
                they&apos;ll appear here.
              </p>

              <a
                href={`/projects/${project.slug}/openings/new`}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium transition hover:bg-violet-500"
              >
                <BriefcaseBusiness
                  size={16}
                />

                Create Opening
              </a>

            </div>

          )}

        </section>

      </section>

    </main>
  );
}

function ApplicationStat({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">

      <div className="text-zinc-500">
        {icon}
      </div>

      <p className="mt-4 text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {label}
      </p>

    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    pending:
      "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",

    accepted:
      "border-green-500/20 bg-green-500/10 text-green-300",

    rejected:
      "border-red-500/20 bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={`w-fit rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${
        styles[status] ||
        "border-white/10 bg-white/[0.04] text-zinc-400"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(
  date: string
) {
  return new Date(
    date
  ).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

