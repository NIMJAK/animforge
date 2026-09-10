"use client";

import Link from "next/link";

import {
  BriefcaseBusiness,
  Compass,
  FolderKanban,
  Search,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import {
  AnimForgeLogo,
  PageBackground,
} from "@/components/animforge/ui";

type Creator = {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  roles: string[] | null;
};

type Project = {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  description: string | null;
  genre: string | null;
  animation_style: string | null;
  status: string;
};

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
};

type Tab =
  | "all"
  | "creators"
  | "projects"
  | "openings";

export default function DiscoverPage() {
  const [creators, setCreators] =
    useState<Creator[]>([]);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [openings, setOpenings] =
    useState<Opening[]>([]);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadDiscover() {
      const supabase = createClient();

      setLoading(true);
      setMessage("");

      const {
        data: creatorData,
        error: creatorError,
      } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          display_name,
          bio,
          roles
        `)
        .not("username", "is", null)
        .order("created_at", {
          ascending: false,
        });

      if (creatorError) {
        console.error(
          "CREATOR ERROR:",
          creatorError
        );
      }

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
          description,
          genre,
          animation_style,
          status
        `)
        .eq("visibility", "public")
        .order("created_at", {
          ascending: false,
        });

      if (projectError) {
        console.error(
          "PROJECT ERROR:",
          projectError
        );
      }

      const publicProjects =
        projectData || [];

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
          location
        `)
        .eq("status", "open")
        .order("created_at", {
          ascending: false,
        });

      if (openingError) {
        console.error(
          "OPENING ERROR:",
          openingError
        );
      }

      const publicProjectIds =
        new Set(
          publicProjects.map(
            (project) => project.id
          )
        );

      const publicOpenings =
        openingData?.filter((opening) =>
          publicProjectIds.has(
            opening.project_id
          )
        ) || [];

      setCreators(creatorData || []);
      setProjects(publicProjects);
      setOpenings(publicOpenings);

      if (
        creatorError &&
        projectError &&
        openingError
      ) {
        setMessage(
          "Could not load Discover."
        );
      }

      setLoading(false);
    }

    loadDiscover();
  }, []);

  const projectMap = useMemo(
    () =>
      new Map(
        projects.map((project) => [
          project.id,
          project,
        ])
      ),
    [projects]
  );

  const query =
    search.trim().toLowerCase();

  const filteredCreators =
    useMemo(() => {
      if (!query) return creators;

      return creators.filter(
        (creator) => {
          const searchable = [
            creator.username,
            creator.display_name,
            creator.bio,
            ...(creator.roles || []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query
          );
        }
      );
    }, [creators, query]);

  const filteredProjects =
    useMemo(() => {
      if (!query) return projects;

      return projects.filter(
        (project) => {
          const searchable = [
            project.title,
            project.description,
            project.genre,
            project.animation_style,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query
          );
        }
      );
    }, [projects, query]);

  const filteredOpenings =
    useMemo(() => {
      if (!query) return openings;

      return openings.filter(
        (opening) => {
          const project =
            projectMap.get(
              opening.project_id
            );

          const searchable = [
            opening.role_title,
            opening.description,
            opening.required_skills,
            opening.compensation_type,
            opening.location_type,
            opening.location,
            project?.title,
            project?.genre,
            project?.animation_style,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query
          );
        }
      );
    }, [
      openings,
      projectMap,
      query,
    ]);

  const totalResults =
    filteredCreators.length +
    filteredProjects.length +
    filteredOpenings.length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      {/* NAV */}
      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <div className="flex items-center gap-2">

            <a
              href="/dashboard"
              className="rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              Dashboard
            </a>

            <Link
              href="/projects"
              className="hidden rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white sm:block"
            >
              Projects
            </Link>

          </div>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[1450px] px-6 pb-24 pt-14">

        {/* HERO */}
        <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl md:p-12">

          <div className="absolute right-[-120px] top-[-130px] h-[400px] w-[400px] rounded-full bg-violet-500/20 blur-[130px]" />

          <div className="absolute bottom-[-170px] left-[30%] h-[350px] w-[350px] rounded-full bg-fuchsia-500/10 blur-[130px]" />

          <div className="relative">

            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">

              <Compass size={15} />

              Discover AnimForge

            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.05] tracking-[-0.035em] sm:text-5xl md:text-6xl">

              Find the people
              <br />

              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                your world needs.
              </span>

            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Discover creators, original
              animation projects and teams
              searching for collaborators.
            </p>

            {/* SEARCH */}
            <div className="relative mt-9 max-w-3xl">

              <Search
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search animators, artists, projects, skills..."
                className="w-full rounded-2xl border border-white/10 bg-black/30 py-4 pl-14 pr-5 text-white outline-none backdrop-blur-xl transition placeholder:text-zinc-600 focus:border-violet-500/50"
              />

            </div>

          </div>

        </div>

        {/* TABS */}
        <div className="mt-8 flex flex-wrap gap-3">

          <DiscoverTab
            active={tab === "all"}
            onClick={() => setTab("all")}
            icon={<Sparkles size={15} />}
            label="Everything"
          />

          <DiscoverTab
            active={tab === "creators"}
            onClick={() =>
              setTab("creators")
            }
            icon={<UserRound size={15} />}
            label={`Creators ${filteredCreators.length}`}
          />

          <DiscoverTab
            active={tab === "projects"}
            onClick={() =>
              setTab("projects")
            }
            icon={
              <FolderKanban size={15} />
            }
            label={`Projects ${filteredProjects.length}`}
          />

          <DiscoverTab
            active={tab === "openings"}
            onClick={() =>
              setTab("openings")
            }
            icon={
              <BriefcaseBusiness
                size={15}
              />
            }
            label={`Openings ${filteredOpenings.length}`}
          />

        </div>

        {query && !loading && (
          <p className="mt-6 text-sm text-zinc-500">
            {totalResults} matches for{" "}
            <span className="text-zinc-300">
              “{search}”
            </span>
          </p>
        )}

        {message && (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200">
            {message}
          </div>
        )}

        {loading ? (
          <div className="py-32 text-center">

            <Sparkles
              size={28}
              className="mx-auto text-violet-400"
            />

            <p className="mt-4 text-zinc-500">
              Exploring the forge...
            </p>

          </div>
        ) : (
          <>

            {/* CREATORS */}
            {(tab === "all" ||
              tab === "creators") && (
              <DiscoverSection
                eyebrow="Creative People"
                title="Creators"
                description="Artists, animators, writers and voices looking to create."
              >

                {filteredCreators.length >
                0 ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                    {filteredCreators.map(
                      (creator, index) => (
                        <CreatorCard
                          key={creator.id}
                          creator={creator}
                          index={index}
                        />
                      )
                    )}

                  </div>
                ) : (
                  <EmptyResult text="No creators matched your search." />
                )}

              </DiscoverSection>
            )}

            {/* PROJECTS */}
            {(tab === "all" ||
              tab === "projects") && (
              <DiscoverSection
                eyebrow="Original Worlds"
                title="Projects"
                description="Explore animation ideas being built by the AnimForge community."
              >

                {filteredProjects.length >
                0 ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                    {filteredProjects.map(
                      (project, index) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          index={index}
                        />
                      )
                    )}

                  </div>
                ) : (
                  <EmptyResult text="No projects matched your search." />
                )}

              </DiscoverSection>
            )}

            {/* OPENINGS */}
            {(tab === "all" ||
              tab === "openings") && (
              <DiscoverSection
                eyebrow="Join a Team"
                title="Open Collaborations"
                description="Projects currently looking for creative talent."
              >

                {filteredOpenings.length >
                0 ? (
                  <div className="grid gap-5 md:grid-cols-2">

                    {filteredOpenings.map(
                      (opening) => {
                        const project =
                          projectMap.get(
                            opening.project_id
                          );

                        if (!project) {
                          return null;
                        }

                        return (
                          <OpeningCard
                            key={opening.id}
                            opening={opening}
                            project={project}
                          />
                        );
                      }
                    )}

                  </div>
                ) : (
                  <EmptyResult text="No open collaborations matched your search." />
                )}

              </DiscoverSection>
            )}

          </>
        )}

      </section>

    </main>
  );
}

function DiscoverTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition ${
        active
          ? "border-violet-500/30 bg-violet-500/15 text-violet-200"
          : "border-white/10 bg-white/[0.025] text-zinc-500 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function DiscoverSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">

      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-black tracking-tight">
        {title}
      </h2>

      <p className="mt-2 text-zinc-500">
        {description}
      </p>

      <div className="mt-7">
        {children}
      </div>

    </section>
  );
}

function CreatorCard({
  creator,
  index,
}: {
  creator: Creator;
  index: number;
}) {
  const name =
    creator.display_name ||
    creator.username ||
    "AnimForge Creator";

  const gradients = [
    "from-violet-500/25 via-fuchsia-500/10 to-transparent",
    "from-blue-500/20 via-violet-500/10 to-transparent",
    "from-pink-500/20 via-orange-500/10 to-transparent",
  ];

  const gradient =
    gradients[index % gradients.length];

  return (
    <a
      href={`/creators/${creator.username}`}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-violet-500/30"
    >

      <div
        className={`h-28 bg-gradient-to-br ${gradient}`}
      />

      <div className="relative px-6 pb-6">

        <div className="-mt-8 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-[#0b0b10] bg-violet-500/20 text-2xl font-black text-violet-200">
          {name.charAt(0).toUpperCase()}
        </div>

        <h3 className="mt-4 text-xl font-semibold">
          {name}
        </h3>

        <p className="mt-1 text-sm text-zinc-600">
          @{creator.username}
        </p>

        {creator.roles &&
          creator.roles.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">

              {creator.roles
                .slice(0, 3)
                .map((role) => (
                  <span
                    key={role}
                    className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300"
                  >
                    {role}
                  </span>
                ))}

            </div>
          )}

        {creator.bio && (
          <p className="mt-4 line-clamp-3 leading-7 text-zinc-500">
            {creator.bio}
          </p>
        )}

        <p className="mt-6 text-sm font-medium text-violet-400">
          Enter profile →
        </p>

      </div>

    </a>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const gradients = [
    "from-violet-500/30 via-fuchsia-500/10 to-blue-500/5",
    "from-blue-500/25 via-cyan-500/10 to-transparent",
    "from-fuchsia-500/25 via-orange-500/10 to-transparent",
  ];

  const gradient =
    gradients[index % gradients.length];

  return (
    <a
      href={`/projects/${project.slug}`}
      className="group overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0d12] transition hover:-translate-y-1 hover:border-violet-500/30"
    >

      <div
        className={`relative h-44 bg-gradient-to-br ${gradient}`}
      >

        <div className="absolute right-6 top-6 text-5xl font-black text-white/[0.06]">
          0{index + 1}
        </div>

        <div className="absolute bottom-5 left-5 flex gap-2">

          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs capitalize backdrop-blur">
            {project.status}
          </span>

          {project.genre && (
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300 backdrop-blur">
              {project.genre}
            </span>
          )}

        </div>

      </div>

      <div className="p-6">

        <h3 className="text-2xl font-bold">
          {project.title}
        </h3>

        {project.description && (
          <p className="mt-3 line-clamp-3 leading-7 text-zinc-500">
            {project.description}
          </p>
        )}

        {project.animation_style && (
          <p className="mt-5 text-xs uppercase tracking-[0.15em] text-zinc-600">
            {project.animation_style}
          </p>
        )}

        <p className="mt-6 text-sm font-medium text-violet-400">
          Enter world →
        </p>

      </div>

    </a>
  );
}

function OpeningCard({
  opening,
  project,
}: {
  opening: Opening;
  project: Project;
}) {
  return (
    <article className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl">

      <div className="absolute right-[-70px] top-[-70px] h-48 w-48 rounded-full bg-fuchsia-500/10 blur-[70px]" />

      <div className="relative">

        <div className="flex items-center justify-between">

          <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-300">
            Open role
          </span>

          <Users
            size={18}
            className="text-zinc-600"
          />

        </div>

        <h3 className="mt-5 text-2xl font-bold">
          {opening.role_title}
        </h3>

        <a
          href={`/projects/${project.slug}`}
          className="mt-2 inline-block text-violet-400"
        >
          {project.title}
        </a>

        {opening.description && (
          <p className="mt-4 line-clamp-3 leading-7 text-zinc-500">
            {opening.description}
          </p>
        )}

        <div className="mt-6 grid gap-4 border-t border-white/[0.07] pt-5 text-sm sm:grid-cols-2">

          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Skills
            </p>

            <p className="mt-2 text-zinc-300">
              {opening.required_skills ||
                "Open to creators"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Work
            </p>

            <p className="mt-2 capitalize text-zinc-300">
              {opening.location_type}
              {opening.location
                ? ` • ${opening.location}`
                : ""}
            </p>
          </div>

        </div>

        <div className="mt-7 flex flex-wrap gap-3">

          <a
            href={`/projects/${project.slug}`}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.07]"
          >
            View Project
          </a>

          <a
            href={`/projects/${project.slug}/openings/${opening.id}/apply`}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:scale-[1.02]"
          >
            Apply to Join
          </a>

        </div>

      </div>

    </article>
  );
}

function EmptyResult({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">

      <Search
        size={24}
        className="mx-auto text-zinc-700"
      />

      <p className="mt-4 text-zinc-500">
        {text}
      </p>

    </div>
  );
}
