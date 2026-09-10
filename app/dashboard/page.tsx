"use client";

import Link from "next/link";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Compass,
  FolderKanban,
  LogOut,
  Palette,
  Plus,
  Sparkles,
  UserRound,
  WandSparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

type Profile = {
  username: string | null;
  display_name: string | null;
  bio: string | null;
  roles: string[] | null;
};

type Project = {
  id: string;
  title: string;
  slug: string;
  genre: string | null;
  animation_style: string | null;
  status: string;
  created_at: string;
};

type JoinedProject = Project & {
  joined_role?: string;
};

type Task = {
  id: string;
  project_id: string;
  title: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
};

type Application = {
  id: string;
  opening_id: string;
  status: string;
  created_at: string;
};

type Opening = {
  id: string;
  project_id: string;
  role_title: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [joinedProjects, setJoinedProjects] = useState<JoinedProject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [openingMap, setOpeningMap] =
    useState<Record<string, Opening>>({});
  const [projectMap, setProjectMap] =
    useState<Record<string, Project>>({});

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/auth/login");
        return;
      }

      const { data: profileData, error: profileError } =
        await supabase
          .from("profiles")
          .select(`
            username,
            display_name,
            bio,
            roles
          `)
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) {
        console.error("PROFILE ERROR:", profileError);
      }

      if (!profileData?.username) {
        router.push("/onboarding");
        return;
      }

      setProfile(profileData);

      const { data: ownedProjects, error: ownedError } =
        await supabase
          .from("projects")
          .select(`
            id,
            title,
            slug,
            genre,
            animation_style,
            status,
            created_at
          `)
          .eq("owner_id", user.id)
          .order("created_at", {
            ascending: false,
          });

      if (ownedError) {
        console.error("OWNED PROJECT ERROR:", ownedError);
      }

      const owned = ownedProjects || [];
      setMyProjects(owned);

      const { data: memberships, error: memberError } =
        await supabase
          .from("project_members")
          .select(`
            project_id,
            role_title
          `)
          .eq("user_id", user.id);

      if (memberError) {
        console.error(
          "PROJECT MEMBERSHIP ERROR:",
          memberError
        );
      }

      let joined: JoinedProject[] = [];

      if (memberships && memberships.length > 0) {
        const joinedIds = memberships.map(
          (membership) => membership.project_id
        );

        const { data: joinedData, error: joinedError } =
          await supabase
            .from("projects")
            .select(`
              id,
              title,
              slug,
              genre,
              animation_style,
              status,
              created_at
            `)
            .in("id", joinedIds);

        if (joinedError) {
          console.error(
            "JOINED PROJECT ERROR:",
            joinedError
          );
        }

        joined =
          joinedData?.map((project) => {
            const membership = memberships.find(
              (item) => item.project_id === project.id
            );

            return {
              ...project,
              joined_role:
                membership?.role_title || "Team Member",
            };
          }) || [];

        setJoinedProjects(joined);
      }

      const { data: taskData, error: taskError } =
        await supabase
          .from("tasks")
          .select(`
            id,
            project_id,
            title,
            status,
            due_date,
            assigned_to
          `)
          .eq("assigned_to", user.id)
          .order("due_date", {
            ascending: true,
          });

      if (taskError) {
        console.error("TASK ERROR:", taskError);
      }

      const loadedTasks = taskData || [];
      setTasks(loadedTasks);

      const {
        data: applicationData,
        error: applicationError,
      } = await supabase
        .from("applications")
        .select(`
          id,
          opening_id,
          status,
          created_at
        `)
        .eq("applicant_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (applicationError) {
        console.error(
          "APPLICATION ERROR:",
          applicationError
        );
      }

      const loadedApplications = applicationData || [];
      setApplications(loadedApplications);

      const openingIds = loadedApplications.map(
        (application) => application.opening_id
      );

      let openings: Opening[] = [];

      if (openingIds.length > 0) {
        const {
          data: openingData,
          error: openingError,
        } = await supabase
          .from("project_openings")
          .select(`
            id,
            project_id,
            role_title
          `)
          .in("id", openingIds);

        if (openingError) {
          console.error("OPENING ERROR:", openingError);
        }

        openings = openingData || [];

        const map: Record<string, Opening> = {};

        openings.forEach((opening) => {
          map[opening.id] = opening;
        });

        setOpeningMap(map);
      }

      const neededProjectIds = new Set<string>();

      owned.forEach((project) =>
        neededProjectIds.add(project.id)
      );

      joined.forEach((project) =>
        neededProjectIds.add(project.id)
      );

      loadedTasks.forEach((task) =>
        neededProjectIds.add(task.project_id)
      );

      openings.forEach((opening) =>
        neededProjectIds.add(opening.project_id)
      );

      let allProjects: Project[] = [
        ...owned,
        ...joined,
      ];

      const alreadyLoaded = new Set(
        allProjects.map((project) => project.id)
      );

      const missingIds = [...neededProjectIds].filter(
        (id) => !alreadyLoaded.has(id)
      );

      if (missingIds.length > 0) {
        const { data: extraProjects } =
          await supabase
            .from("projects")
            .select(`
              id,
              title,
              slug,
              genre,
              animation_style,
              status,
              created_at
            `)
            .in("id", missingIds);

        allProjects = [
          ...allProjects,
          ...(extraProjects || []),
        ];
      }

      const projectsLookup: Record<string, Project> = {};

      allProjects.forEach((project) => {
        projectsLookup[project.id] = project;
      });

      setProjectMap(projectsLookup);
      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/auth/login");
    router.refresh();
  }

  const incompleteTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.status !== "completed"
      ),
    [tasks]
  );

  const pendingApplications = useMemo(
    () =>
      applications.filter(
        (application) =>
          application.status === "pending"
      ),
    [applications]
  );

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050507] text-white">

        <div className="absolute left-[-150px] top-[-150px] h-[500px] w-[500px] rounded-full bg-violet-700/20 blur-[140px]" />

        <div className="absolute bottom-[-180px] right-[-120px] h-[450px] w-[450px] rounded-full bg-fuchsia-700/10 blur-[130px]" />

        <div className="relative text-center">
          <div className="text-4xl font-black tracking-tight">
            Anim
            <span className="text-violet-500">
              Forge
            </span>
          </div>

          <p className="mt-4 text-zinc-400">
            Opening your creative studio...
          </p>
        </div>

      </main>
    );
  }

  const creatorName =
    profile?.display_name ||
    profile?.username ||
    "Creator";

  return (
    <main className="min-h-screen overflow-hidden bg-[#060608] text-white">

      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute left-[-170px] top-[60px] h-[500px] w-[500px] rounded-full bg-violet-700/15 blur-[160px]" />

        <div className="absolute right-[-120px] top-[380px] h-[450px] w-[450px] rounded-full bg-fuchsia-700/10 blur-[150px]" />

        <div className="absolute bottom-[-200px] left-[35%] h-[500px] w-[500px] rounded-full bg-blue-700/10 blur-[150px]" />

      </div>

      {/* NAVBAR */}
      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-6 py-5">

          <a
            href="/dashboard"
            className="group flex items-center gap-3"
          >

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10">

              <WandSparkles
                size={19}
                className="text-violet-400"
              />

            </div>

            <div className="text-2xl font-black tracking-tight">
              Anim
              <span className="text-violet-500">
                Forge
              </span>
            </div>

          </a>

          <div className="hidden items-center gap-2 md:flex">

            <NavLink
              href="/discover"
              icon={<Compass size={17} />}
              label="Discover"
            />

            <NavLink
              href="/projects"
              icon={<FolderKanban size={17} />}
              label="Projects"
            />

            {profile?.username && (
              <NavLink
                href={`/creators/${profile.username}`}
                icon={<UserRound size={17} />}
                label="Profile"
              />
            )}

          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">
              Log out
            </span>
          </button>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[1450px] px-6 pb-20 pt-10">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-12">

          <div className="absolute right-[-70px] top-[-90px] h-[300px] w-[300px] rounded-full bg-violet-500/20 blur-[100px]" />

          <div className="absolute bottom-[-120px] left-[30%] h-[260px] w-[260px] rounded-full bg-fuchsia-500/10 blur-[100px]" />

          <div className="relative grid gap-10 lg:grid-cols-[1.4fr_.6fr] lg:items-end">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">

                <Sparkles size={15} />

                Creative Workspace

              </div>

              <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">

                Welcome back,
                <br />

                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  {creatorName}.
                </span>

              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
                Your creative universe is waiting.
                Continue your projects, collaborate
                with your team and turn ideas into
                animated worlds.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                <Link
                  href="/projects/new"
                  className="group flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-black transition hover:scale-[1.02]"
                >
                  <Plus size={18} />

                  Create Project

                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>

                <a
                  href="/discover"
                  className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-medium text-zinc-200 transition hover:bg-white/[0.08]"
                >
                  <Compass size={18} />
                  Explore AnimForge
                </a>

              </div>

            </div>

            <div className="rounded-[26px] border border-white/10 bg-black/20 p-6 backdrop-blur-xl">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Creator Identity
              </p>

              <div className="mt-5 flex items-center gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-2xl font-bold text-violet-200">

                  {creatorName
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <div>

                  <h2 className="text-xl font-semibold">
                    {creatorName}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    @{profile?.username}
                  </p>

                </div>

              </div>

              {profile?.roles &&
                profile.roles.length > 0 && (

                  <div className="mt-6 flex flex-wrap gap-2">

                    {profile.roles
                      .slice(0, 4)
                      .map((role) => (

                        <span
                          key={role}
                          className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300"
                        >
                          {role}
                        </span>

                      ))}

                  </div>

                )}

              <a
                href={`/creators/${profile?.username}`}
                className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-300 transition hover:bg-white/[0.06]"
              >
                View public profile

                <ArrowRight size={15} />
              </a>

            </div>

          </div>

        </section>

        {/* STATS */}
        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={<FolderKanban size={20} />}
            label="Projects Created"
            value={myProjects.length}
            description="Your worlds"
          />

          <StatCard
            icon={<BriefcaseBusiness size={20} />}
            label="Projects Joined"
            value={joinedProjects.length}
            description="Your collaborations"
          />

          <StatCard
            icon={<Palette size={20} />}
            label="Open Tasks"
            value={incompleteTasks.length}
            description="Work in motion"
          />

          <StatCard
            icon={<Sparkles size={20} />}
            label="Applications"
            value={pendingApplications.length}
            description="Waiting for response"
          />

        </section>

        {message && (
          <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            {message}
          </div>
        )}

        {/* MAIN GRID */}
        <section className="mt-12 grid gap-8 xl:grid-cols-[1.45fr_.75fr]">

          {/* LEFT */}
          <div className="space-y-10">

            {/* MY PROJECTS */}
            <ArtSection
              eyebrow="Your Studio"
              title="Projects You're Building"
              description="Your original animation worlds."
              action={
                <Link
                  href="/projects/new"
                  className="text-sm font-medium text-violet-400 hover:text-violet-300"
                >
                  New project →
                </Link>
              }
            >

              {myProjects.length > 0 ? (

                <div className="grid gap-5 lg:grid-cols-2">

                  {myProjects.map(
                    (project, index) => (

                      <ProjectArtCard
                        key={project.id}
                        project={project}
                        index={index}
                        owner
                      />

                    )
                  )}

                </div>

              ) : (

                <ArtEmpty
                  title="Your first world starts here."
                  text="Create a project, tell its story and start building your team."
                  href="/projects/new"
                  button="Create Project"
                />

              )}

            </ArtSection>

            {/* JOINED */}
            <ArtSection
              eyebrow="Collaborations"
              title="Teams You're Part Of"
              description="Projects where your skills are helping someone else's vision."
            >

              {joinedProjects.length > 0 ? (

                <div className="grid gap-5 lg:grid-cols-2">

                  {joinedProjects.map(
                    (project, index) => (

                      <JoinedProjectCard
                        key={project.id}
                        project={project}
                        index={index}
                      />

                    )
                  )}

                </div>

              ) : (

                <ArtEmpty
                  title="Join someone else's world."
                  text="Explore collaboration openings and find a team that needs your skills."
                  href="/discover"
                  button="Find Collaborations"
                />

              )}

            </ArtSection>

          </div>

          {/* RIGHT */}
          <div className="space-y-8">

            {/* TASKS */}
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                    Production
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    My Tasks
                  </h2>

                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                  {incompleteTasks.length}
                </span>

              </div>

              <div className="mt-6 space-y-3">

                {incompleteTasks.length > 0 ? (

                  incompleteTasks
                    .slice(0, 6)
                    .map((task) => {

                      const project =
                        projectMap[
                          task.project_id
                        ];

                      return (
                        <a
                          key={task.id}
                          href={
                            project
                              ? `/projects/${project.slug}/board`
                              : "#"
                          }
                          className="group block rounded-2xl border border-white/[0.07] bg-black/20 p-4 transition hover:border-violet-500/30 hover:bg-violet-500/[0.04]"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div>

                              <h3 className="font-medium text-zinc-100">
                                {task.title}
                              </h3>

                              <p className="mt-1 text-xs text-zinc-500">
                                {project?.title ||
                                  "AnimForge Project"}
                              </p>

                            </div>

                            <TaskDot
                              status={task.status}
                            />

                          </div>

                          <div className="mt-4 flex items-center justify-between text-xs">

                            <span className="text-zinc-500">
                              {task.due_date
                                ? `Due ${formatDate(
                                    task.due_date
                                  )}`
                                : "No deadline"}
                            </span>

                            <span className="text-violet-400 opacity-0 transition group-hover:opacity-100">
                              Open →
                            </span>

                          </div>

                        </a>
                      );
                    })

                ) : (

                  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">

                    <Sparkles
                      size={22}
                      className="mx-auto text-zinc-600"
                    />

                    <p className="mt-3 text-sm text-zinc-500">
                      No open tasks.
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* APPLICATIONS */}
            <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-400">
                Opportunities
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                My Applications
              </h2>

              <div className="mt-6 space-y-3">

                {applications.length > 0 ? (

                  applications
                    .slice(0, 5)
                    .map((application) => {

                      const opening =
                        openingMap[
                          application.opening_id
                        ];

                      const project =
                        opening
                          ? projectMap[
                              opening.project_id
                            ]
                          : undefined;

                      return (
                        <a
                          key={application.id}
                          href={
                            project
                              ? `/projects/${project.slug}`
                              : "#"
                          }
                          className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-black/20 p-4 transition hover:border-fuchsia-500/30"
                        >

                          <div className="min-w-0">

                            <p className="truncate font-medium">
                              {opening?.role_title ||
                                "Collaboration Role"}
                            </p>

                            <p className="mt-1 truncate text-xs text-zinc-500">
                              {project?.title ||
                                "AnimForge Project"}
                            </p>

                          </div>

                          <StatusPill
                            status={
                              application.status
                            }
                          />

                        </a>
                      );
                    })

                ) : (

                  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">

                    <p className="text-sm text-zinc-500">
                      You haven&apos;t applied to
                      any projects yet.
                    </p>

                    <a
                      href="/discover"
                      className="mt-4 inline-block text-sm text-violet-400"
                    >
                      Explore openings →
                    </a>

                  </div>

                )}

              </div>

            </div>

          </div>

        </section>

        {/* CREATIVE ACTIONS */}
        <ArtSection
          eyebrow="Forge Something"
          title="Where do you want to go next?"
          description="Every great animation starts with one small action."
        >

          <div className="grid gap-5 md:grid-cols-3">

            <CreativeAction
              icon={<WandSparkles size={23} />}
              title="Start a World"
              text="Turn your story idea into a new animation project."
              href="/projects/new"
            />

            <CreativeAction
              icon={<Compass size={23} />}
              title="Find Your People"
              text="Discover artists, writers, voice actors and teams."
              href="/discover"
            />

            <CreativeAction
              icon={<Palette size={23} />}
              title="Show Your Work"
              text="Add your latest artwork or animation work to your portfolio."
              href="/dashboard/portfolio/new"
            />

          </div>

        </ArtSection>

      </section>

    </main>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
    >
      {icon}
      {label}
    </a>
  );
}

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-500/20">

      <div className="absolute right-[-30px] top-[-30px] h-24 w-24 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-violet-300">
          {icon}
        </div>

        <p className="mt-6 text-4xl font-black tracking-tight">
          {value}
        </p>

        <p className="mt-2 font-medium text-zinc-200">
          {label}
        </p>

        <p className="mt-1 text-xs text-zinc-600">
          {description}
        </p>

      </div>

    </div>
  );
}

function ArtSection({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">

      <div className="flex items-end justify-between gap-6">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            {eyebrow}
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            {title}
          </h2>

          <p className="mt-2 text-zinc-500">
            {description}
          </p>

        </div>

        {action}

      </div>

      <div className="mt-7">
        {children}
      </div>

    </section>
  );
}

function ProjectArtCard({
  project,
  index,
  owner,
}: {
  project: Project;
  index: number;
  owner?: boolean;
}) {
  const gradients = [
    "from-violet-500/25 via-fuchsia-500/10 to-transparent",
    "from-blue-500/20 via-violet-500/10 to-transparent",
    "from-pink-500/20 via-orange-500/10 to-transparent",
    "from-cyan-500/20 via-blue-500/10 to-transparent",
  ];

  const gradient =
    gradients[index % gradients.length];

  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0d12]">

      <div
        className={`relative h-44 bg-gradient-to-br ${gradient}`}
      >

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.12),transparent_30%)]" />

        <div className="absolute bottom-5 left-5">

          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs capitalize text-zinc-200 backdrop-blur-xl">
            {project.status}
          </span>

        </div>

        <div className="absolute right-6 top-6 text-5xl font-black text-white/[0.06]">
          0{index + 1}
        </div>

      </div>

      <div className="p-6">

        <div className="flex flex-wrap gap-2 text-xs text-zinc-500">

          {project.genre && (
            <span>{project.genre}</span>
          )}

          {project.genre &&
            project.animation_style && (
              <span>•</span>
            )}

          {project.animation_style && (
            <span>
              {project.animation_style}
            </span>
          )}

        </div>

        <h3 className="mt-3 text-2xl font-bold">
          {project.title}
        </h3>

        <div className="mt-6 flex flex-wrap gap-4 text-sm">

          <a
            href={`/projects/${project.slug}`}
            className="font-medium text-violet-400 hover:text-violet-300"
          >
            Open Project →
          </a>

          <a
            href={`/projects/${project.slug}/board`}
            className="text-zinc-500 hover:text-white"
          >
            Board
          </a>

          {owner && (
            <a
              href={`/projects/${project.slug}/applications`}
              className="text-zinc-500 hover:text-white"
            >
              Applications
            </a>
          )}

        </div>

      </div>

    </div>
  );
}

function JoinedProjectCard({
  project,
  index,
}: {
  project: JoinedProject;
  index: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-6">

      <div className="absolute right-[-30px] top-[-40px] h-36 w-36 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative">

        <span className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-300">
          {project.joined_role ||
            "Team Member"}
        </span>

        <p className="mt-7 text-xs uppercase tracking-[0.2em] text-zinc-600">
          Collaboration 0{index + 1}
        </p>

        <h3 className="mt-2 text-2xl font-bold">
          {project.title}
        </h3>

        <div className="mt-6 flex gap-5 text-sm">

          <a
            href={`/projects/${project.slug}`}
            className="text-violet-400"
          >
            Project →
          </a>

          <a
            href={`/projects/${project.slug}/board`}
            className="text-zinc-500 hover:text-white"
          >
            Workspace
          </a>

        </div>

      </div>

    </div>
  );
}

function CreativeAction({
  icon,
  title,
  text,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-7 transition hover:-translate-y-1 hover:border-violet-500/30"
    >

      <div className="absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
          {icon}
        </div>

        <h3 className="mt-6 text-xl font-semibold">
          {title}
        </h3>

        <p className="mt-3 leading-7 text-zinc-500">
          {text}
        </p>

        <div className="mt-7 flex items-center gap-2 text-sm font-medium text-violet-400">

          Open

          <ArrowRight
            size={16}
            className="transition group-hover:translate-x-1"
          />

        </div>

      </div>

    </a>
  );
}

function ArtEmpty({
  title,
  text,
  href,
  button,
}: {
  title: string;
  text: string;
  href: string;
  button: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">

      <Sparkles
        size={26}
        className="mx-auto text-violet-500"
      />

      <h3 className="mt-5 text-xl font-semibold">
        {title}
      </h3>

      <p className="mx-auto mt-3 max-w-md text-zinc-500">
        {text}
      </p>

      <a
        href={href}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium hover:bg-violet-500"
      >
        {button}
        <ArrowRight size={15} />
      </a>

    </div>
  );
}

function TaskDot({
  status,
}: {
  status: string;
}) {
  const classes: Record<string, string> = {
    backlog: "bg-zinc-500",
    todo: "bg-blue-400",
    in_progress: "bg-violet-400",
    review: "bg-orange-400",
    completed: "bg-green-400",
  };

  return (
    <span
      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
        classes[status] || "bg-zinc-500"
      }`}
    />
  );
}

function StatusPill({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    pending:
      "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",

    accepted:
      "border-green-500/20 bg-green-500/10 text-green-300",

    rejected:
      "border-red-500/20 bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs capitalize ${
        styles[status] ||
        "border-white/10 bg-white/5 text-zinc-400"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(date: string) {
  return new Date(
    `${date}T00:00:00`
  ).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}
