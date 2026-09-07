import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  FolderOpen,
  Clapperboard,
  LayoutDashboard,
  MessageCircle,
  Pencil,
  Sparkles,
  Users,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import {
  AnimForgeLogo,
  PageBackground,
} from "@/components/animforge/ui";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug: rawSlug } =
    await params;

  const slug =
    decodeURIComponent(
      rawSlug
    );

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  // PROJECT
  const {
    data: project,
  } = await supabase
    .from("projects")
    .select(`
      id,
      owner_id,
      title,
      slug,
      description,
      genre,
      animation_style,
      target_audience,
      visibility,
      status,
      created_at
    `)
    .eq("slug", slug)
    .maybeSingle();

  if (!project) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060608] text-white">
        <PageBackground />

        <div className="relative z-10 max-w-lg px-6 text-center">
          <Clapperboard
            size={34}
            className="mx-auto text-violet-400"
          />

          <h1 className="mt-6 text-4xl font-black">
            Project not found.
          </h1>

          <p className="mt-4 text-zinc-500">
            This animation world may have been removed
            or you may not have access to it.
          </p>

          <a
            href="/projects"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black"
          >
            <ArrowLeft size={16} />
            Browse Projects
          </a>
        </div>
      </main>
    );
  }

  const isOwner =
    user?.id === project.owner_id;

  // OWNER
  const {
    data: owner,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      bio,
      avatar_url
    `)
    .eq(
      "id",
      project.owner_id
    )
    .maybeSingle();

  // TEAM
  const {
    data: memberRows,
  } = await supabase
    .from("project_members")
    .select(`
      user_id,
      role_title,
      joined_at
    `)
    .eq(
      "project_id",
      project.id
    );

  const memberIds =
    memberRows?.map(
      (member) =>
        member.user_id
    ) || [];

  let memberProfiles: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  }[] = [];

  if (memberIds.length > 0) {
    const {
      data,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        display_name,
        avatar_url
      `)
      .in(
        "id",
        memberIds
      );

    memberProfiles =
      data || [];
  }

  const members =
    memberRows?.map(
      (member) => {
        const profile =
          memberProfiles.find(
            (item) =>
              item.id ===
              member.user_id
          );

        return {
          user_id:
            member.user_id,

          role_title:
            member.role_title,

          username:
            profile?.username ||
            null,

          display_name:
            profile?.display_name ||
            profile?.username ||
            "AnimForge Creator",

          avatar_url:
            profile?.avatar_url ||
            null,
        };
      }
    ) || [];

  const isMember =
    !!user &&
    members.some(
      (member) =>
        member.user_id ===
        user.id
    );

  const canOpenWorkspace =
    isOwner ||
    isMember;

  // OPENINGS
  const {
    data: openingsData,
  } = await supabase
    .from("project_openings")
    .select(`
      id,
      role_title,
      description,
      required_skills,
      compensation_type,
      compensation_details,
      location_type,
      location,
      status
    `)
    .eq(
      "project_id",
      project.id
    )
    .eq(
      "status",
      "open"
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  const openings =
    openingsData || [];

  const ownerName =
    owner?.display_name ||
    owner?.username ||
    "AnimForge Creator";

  const teamCount =
    members.length + 1;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">
      <PageBackground />

      {/* NAV */}
      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-6 py-5">
          <AnimForgeLogo />

          <div className="flex items-center gap-2">
            <a
              href="/discover"
              className="rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              Discover
            </a>

            {user && (
              <a
                href="/dashboard"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.07]"
              >
                Dashboard
              </a>
            )}
          </div>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-[1450px] px-6 pb-24 pt-10">
        <a
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          All Projects
        </a>

        {/* HERO */}
        <div className="relative mt-7 overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
          <div className="relative min-h-[420px] overflow-hidden bg-gradient-to-br from-violet-500/25 via-fuchsia-500/10 to-blue-500/10 p-8 md:p-12">
            <div className="absolute right-[-100px] top-[-120px] h-[430px] w-[430px] rounded-full bg-violet-500/20 blur-[140px]" />

            <div className="absolute bottom-[-170px] left-[28%] h-[360px] w-[360px] rounded-full bg-fuchsia-500/15 blur-[130px]" />

            <div className="absolute right-[8%] top-[20%] h-52 w-52 rounded-full border border-white/[0.06]" />

            <div className="relative flex min-h-[330px] flex-col justify-between">
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs font-medium capitalize text-violet-300">
                  {project.status}
                </span>

                <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs capitalize text-zinc-400">
                  {project.visibility}
                </span>
              </div>

              <div className="max-w-4xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
                  AnimForge World
                </p>

                <h1 className="mt-5 text-5xl font-black leading-[0.98] tracking-[-0.045em] md:text-7xl">
                  {project.title}
                </h1>

                {project.description && (
                  <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300/80">
                    {project.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="flex flex-col gap-4 border-t border-white/[0.07] bg-black/20 px-7 py-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {project.genre && (
                <InfoBadge>
                  {project.genre}
                </InfoBadge>
              )}

              {project.animation_style && (
                <InfoBadge>
                  {project.animation_style}
                </InfoBadge>
              )}

              {project.target_audience && (
                <InfoBadge>
                  {project.target_audience}
                </InfoBadge>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {canOpenWorkspace && (
                <>
                  <a
                    href={`/projects/${project.slug}/board`}
                    className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                  >
                    <LayoutDashboard
                      size={16}
                    />

                    Workspace
                  </a>

                  <a
                    href={`/projects/${project.slug}/chat`}
                    className="flex items-center gap-2 rounded-2xl border border-violet-500/25 bg-violet-500/10 px-5 py-3 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20"
                  >
                    <MessageCircle
                      size={16}
                    />

                    Team Chat
                  </a>

                  <a
                    href={`/projects/${project.slug}/ai`}
                    className="flex items-center gap-2 rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/10 px-5 py-3 text-sm font-medium text-fuchsia-300 transition hover:bg-fuchsia-500/20"
                  >
                    <Sparkles
                      size={16}
                    />

                    AI Workspace
                  </a>

                  <a
                    href={`/projects/${project.slug}/assets`}
                    className="flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
                  >
                    <FolderOpen
                      size={16}
                    />

                    Project Assets
                  </a>
                </>
              )}

              {isOwner && (
                <>
                  <a
                    href={`/projects/${project.slug}/edit`}
                    className="flex items-center gap-2 rounded-2xl border border-violet-500/25 bg-violet-500/10 px-5 py-3 text-sm font-medium text-violet-300 transition hover:bg-violet-500/20"
                  >
                    <Pencil size={16} />

                    Edit Project
                  </a>

                  <a
                    href={`/projects/${project.slug}/applications`}
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08]"
                  >
                    <Users size={16} />

                    Applications
                  </a>

                  <a
                    href={`/projects/${project.slug}/openings/new`}
                    className="flex items-center gap-2 rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-5 py-3 text-sm font-medium text-fuchsia-300 transition hover:bg-fuchsia-500/20"
                  >
                    <BriefcaseBusiness
                      size={16}
                    />

                    Add Opening
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-10 grid gap-9 xl:grid-cols-[.65fr_1.35fr]">
          {/* LEFT */}
          <aside className="space-y-6">
            {/* OWNER */}
            <div className="rounded-[30px] border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                Project Creator
              </p>

              <div className="mt-6 flex items-center gap-4">
                {owner?.avatar_url ? (
                  <img
                    src={
                      owner.avatar_url
                    }
                    alt={
                      ownerName
                    }
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-xl font-black text-violet-300">
                    {ownerName
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold">
                    {ownerName}
                  </h2>

                  {owner?.username && (
                    <p className="mt-1 text-sm text-zinc-600">
                      @{owner.username}
                    </p>
                  )}
                </div>
              </div>

              {owner?.bio && (
                <p className="mt-5 line-clamp-4 leading-7 text-zinc-500">
                  {owner.bio}
                </p>
              )}

              {owner?.username && (
                <a
                  href={`/creators/${owner.username}`}
                  className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300 transition hover:border-violet-500/30"
                >
                  View Creator Profile

                  <ArrowRight
                    size={15}
                  />
                </a>
              )}
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4">
              <ProjectStat
                value={teamCount}
                label="Team"
              />

              <ProjectStat
                value={openings.length}
                label="Open Roles"
              />
            </div>
          </aside>

          {/* RIGHT */}
          <div>
            {/* TEAM */}
            <section>
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-400">
                    Production Crew
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    Team
                  </h2>

                  <p className="mt-2 text-zinc-500">
                    The creators building this world together.
                  </p>
                </div>

                {canOpenWorkspace && (
                  <a
                    href={`/projects/${project.slug}/chat`}
                    className="hidden items-center gap-2 text-sm font-medium text-violet-400 sm:flex"
                  >
                    <MessageCircle
                      size={15}
                    />

                    Open Team Chat
                  </a>
                )}
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {/* OWNER TEAM CARD */}
                <TeamCard
                  name={ownerName}
                  username={
                    owner?.username ||
                    null
                  }
                  avatarUrl={
                    owner?.avatar_url ||
                    null
                  }
                  role="Project Owner"
                />

                {members.map(
                  (member) => (
                    <TeamCard
                      key={
                        member.user_id
                      }
                      name={
                        member.display_name
                      }
                      username={
                        member.username
                      }
                      avatarUrl={
                        member.avatar_url
                      }
                      role={
                        member.role_title
                      }
                    />
                  )
                )}
              </div>
            </section>

            {/* OPENINGS */}
            <section className="mt-16">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
                Join The Production
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Open Collaborations
              </h2>

              <p className="mt-2 text-zinc-500">
                Roles this project currently needs.
              </p>

              {openings.length > 0 ? (
                <div className="mt-7 grid gap-5">
                  {openings.map(
                    (opening) => (
                      <article
                        key={
                          opening.id
                        }
                        className="rounded-[30px] border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl"
                      >
                        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                          <div className="max-w-3xl">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
                              <Sparkles
                                size={13}
                              />

                              Open Role
                            </div>

                            <h3 className="mt-3 text-2xl font-bold">
                              {opening.role_title}
                            </h3>

                            {opening.description && (
                              <p className="mt-4 leading-7 text-zinc-500">
                                {
                                  opening.description
                                }
                              </p>
                            )}

                            <div className="mt-5 flex flex-wrap gap-2">
                              {opening.required_skills && (
                                <SmallBadge>
                                  {
                                    opening.required_skills
                                  }
                                </SmallBadge>
                              )}

                              <SmallBadge>
                                {formatCompensation(
                                  opening.compensation_type
                                )}
                              </SmallBadge>

                              <SmallBadge>
                                {opening.location_type}
                              </SmallBadge>
                            </div>
                          </div>

                          {!isOwner &&
                            user && (
                              <a
                                href={`/projects/${project.slug}/openings/${opening.id}/apply`}
                                className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                              >
                                Apply

                                <ArrowRight
                                  size={15}
                                />
                              </a>
                            )}
                        </div>
                      </article>
                    )
                  )}
                </div>
              ) : (
                <div className="mt-7 rounded-[30px] border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
                  <BriefcaseBusiness
                    size={27}
                    className="mx-auto text-zinc-700"
                  />

                  <h3 className="mt-5 text-xl font-semibold">
                    No open roles right now.
                  </h3>

                  <p className="mt-2 text-zinc-600">
                    This production currently has no public collaboration openings.
                  </p>

                  {isOwner && (
                    <a
                      href={`/projects/${project.slug}/openings/new`}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium transition hover:bg-violet-500"
                    >
                      Add Opening
                    </a>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-zinc-400">
      {children}
    </span>
  );
}

function SmallBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-1.5 text-xs capitalize text-zinc-500">
      {children}
    </span>
  );
}

function ProjectStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5 text-center backdrop-blur-xl">
      <p className="text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {label}
      </p>
    </div>
  );
}

function TeamCard({
  name,
  username,
  avatarUrl,
  role,
}: {
  name: string;
  username: string | null;
  avatarUrl: string | null;
  role: string;
}) {
  const content = (
    <div className="flex items-center gap-4">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="h-14 w-14 rounded-2xl object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-lg font-black text-violet-300">
          {name
            .charAt(0)
            .toUpperCase()}
        </div>
      )}

      <div className="min-w-0">
        <h3 className="truncate font-semibold">
          {name}
        </h3>

        <p className="mt-1 truncate text-sm text-violet-400">
          {role}
        </p>

        {username && (
          <p className="mt-1 truncate text-xs text-zinc-700">
            @{username}
          </p>
        )}
      </div>
    </div>
  );

  if (username) {
    return (
      <a
        href={`/creators/${username}`}
        className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 transition hover:border-violet-500/25 hover:bg-white/[0.05]"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
      {content}
    </div>
  );
}

function formatCompensation(
  type: string
) {
  const labels: Record<
    string,
    string
  > = {
    unpaid:
      "Unpaid collaboration",

    fixed:
      "Fixed payment",

    hourly:
      "Hourly",

    revenue_share:
      "Revenue share",

    negotiable:
      "Negotiable",
  };

  return labels[type] || type;
}
