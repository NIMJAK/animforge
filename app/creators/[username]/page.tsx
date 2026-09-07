import DeletePortfolioButton from "@/components/animforge/delete-portfolio-button";
import {
  ArrowLeft,
  ArrowRight,
  Clapperboard,
  ImageIcon,
  Palette,
  Pencil,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

import {
  AnimForgeLogo,
  PageBackground,
} from "@/components/animforge/ui";

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{
    username: string;
  }>;
}) {
  const {
    username: rawUsername,
  } = await params;

  const username =
    decodeURIComponent(
      rawUsername
    );

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      display_name,
      bio,
      roles,
      avatar_url,
      created_at
    `)
    .eq(
      "username",
      username
    )
    .maybeSingle();

  if (!profile) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060608] text-white">

        <PageBackground />

        <div className="relative z-10 px-6 text-center">

          <UserRound
            size={32}
            className="mx-auto text-violet-400"
          />

          <h1 className="mt-6 text-4xl font-black">
            Creator not found.
          </h1>

          <a
            href="/discover"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-black"
          >
            <ArrowLeft size={16} />
            Discover Creators
          </a>

        </div>

      </main>
    );
  }

  const isOwnProfile =
    user?.id === profile.id;

  const {
    data: portfolioData,
  } = await supabase
    .from("portfolio_items")
    .select(`
      id,
      title,
      description,
      image_url,
      created_at
    `)
    .eq(
      "user_id",
      profile.id
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  const portfolio =
    portfolioData || [];

  const {
    data: projectData,
  } = await supabase
    .from("projects")
    .select(`
      id,
      title,
      slug,
      description,
      genre,
      animation_style,
      status
    `)
    .eq(
      "owner_id",
      profile.id
    )
    .eq(
      "visibility",
      "public"
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  const projects =
    projectData || [];

  const creatorName =
    profile.display_name ||
    profile.username ||
    "AnimForge Creator";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      {/* NAVBAR */}
      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1450px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <div className="flex gap-2">

            <a
              href="/discover"
              className="rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              Discover
            </a>

            {user && (
              <a
                href="/dashboard"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300"
              >
                Dashboard
              </a>
            )}

          </div>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[1450px] px-6 pb-24 pt-10">

        <a
          href="/discover"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Discover creators
        </a>

        {/* PROFILE HERO */}
        <div className="relative mt-7 overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.04] backdrop-blur-xl">

          {/* COVER */}
          <div className="relative h-64 overflow-hidden bg-gradient-to-br from-violet-500/30 via-fuchsia-500/10 to-blue-500/10 md:h-72">

            <div className="absolute right-[-80px] top-[-140px] h-[400px] w-[400px] rounded-full bg-violet-400/20 blur-[120px]" />

            <div className="absolute bottom-[-180px] left-[30%] h-[360px] w-[360px] rounded-full bg-fuchsia-500/15 blur-[120px]" />

            <div className="absolute right-[18%] top-[20%] h-36 w-36 rounded-full border border-white/[0.07] bg-white/[0.02]" />

            <div className="absolute bottom-6 right-7 text-6xl font-black text-white/[0.04] md:text-8xl">
              FORGE
            </div>

          </div>

          {/* IDENTITY */}
          <div className="relative px-7 pb-8 md:px-10">

            <div className="-mt-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">

                {profile.avatar_url ? (
                  <img
                    src={
                      profile.avatar_url
                    }
                    alt={
                      creatorName
                    }
                    className="h-32 w-32 rounded-[30px] border-[6px] border-[#0a0a0e] object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-[30px] border-[6px] border-[#0a0a0e] bg-gradient-to-br from-violet-500 to-fuchsia-600 text-5xl font-black text-white">

                    {creatorName
                      .charAt(0)
                      .toUpperCase()}

                  </div>
                )}

                <div className="pb-2">

                  <div className="flex items-center gap-2">

                    <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                      {creatorName}
                    </h1>

                    <Sparkles
                      size={18}
                      className="text-violet-400"
                    />

                  </div>

                  <p className="mt-2 text-zinc-600">
                    @{profile.username}
                  </p>

                </div>

              </div>

              {/* OWN PROFILE ACTIONS */}
              {isOwnProfile && (
                <div className="flex flex-wrap gap-3">

                  <a
                    href="/dashboard/profile/edit"
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08]"
                  >
                    <Pencil
                      size={16}
                    />

                    Edit Profile
                  </a>

                  <a
                    href="/dashboard/portfolio/new"
                    className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]"
                  >
                    <Plus
                      size={16}
                    />

                    Add Work
                  </a>

                </div>
              )}

            </div>

            {profile.roles &&
              profile.roles.length >
                0 && (
                <div className="mt-7 flex flex-wrap gap-2">

                  {profile.roles.map(
                    (
                      role: string
                    ) => (
                      <span
                        key={role}
                        className="rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-xs text-violet-300"
                      >
                        {role}
                      </span>
                    )
                  )}

                </div>
              )}

          </div>

        </div>

        {/* CONTENT */}
        <div className="mt-10 grid gap-9 xl:grid-cols-[.55fr_1.45fr]">

          {/* ABOUT */}
          <aside>

            <div className="rounded-[30px] border border-white/10 bg-white/[0.035] p-7 backdrop-blur-xl">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
                <UserRound
                  size={20}
                />
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                About Creator
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Creative Story
              </h2>

              <p className="mt-5 leading-8 text-zinc-500">
                {profile.bio ||
                  "This creator hasn't written their story yet."}
              </p>

              <div className="mt-7 border-t border-white/[0.07] pt-6">

                <p className="text-xs uppercase tracking-[0.16em] text-zinc-700">
                  AnimForge Portfolio
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <ProfileStat
                    value={
                      portfolio.length
                    }
                    label="Works"
                  />

                  <ProfileStat
                    value={
                      projects.length
                    }
                    label="Projects"
                  />

                </div>

              </div>

            </div>

          </aside>

          {/* RIGHT */}
          <div>

            {/* PORTFOLIO */}
            <section>

              <div className="flex items-end justify-between gap-5">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-400">
                    Selected Work
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    Portfolio
                  </h2>

                  <p className="mt-2 text-zinc-500">
                    Art and animation work by{" "}
                    {creatorName}.
                  </p>

                </div>

                {isOwnProfile && (
                  <a
                    href="/dashboard/portfolio/new"
                    className="hidden items-center gap-2 text-sm font-medium text-violet-400 sm:flex"
                  >
                    <Plus size={15} />
                    Add Work
                  </a>
                )}

              </div>

              {portfolio.length > 0 ? (
                <div className="mt-7 columns-1 gap-5 sm:columns-2">

                  {portfolio.map(
                    (item) => (
                      <article
                        key={item.id}
                        className="mb-5 break-inside-avoid overflow-hidden rounded-[28px] border border-white/10 bg-[#0d0d12]"
                      >

                        {item.image_url ? (
                          <div className="overflow-hidden">

                            <img
                              src={
                                item.image_url
                              }
                              alt={
                                item.title
                              }
                              className="w-full object-cover transition duration-500 hover:scale-[1.03]"
                            />

                          </div>
                        ) : (
                          <div className="flex h-52 items-center justify-center bg-white/[0.03]">

                            <ImageIcon className="text-zinc-700" />

                          </div>
                        )}

                        <div className="p-6">

                          <h3 className="text-xl font-semibold">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="mt-3 leading-7 text-zinc-500">
                              {
                                item.description
                              }
                            </p>
                          )}

                          {isOwnProfile && (
                            <DeletePortfolioButton
                              itemId={item.id}
                              storagePath={item.storage_path}
                              title={item.title}
                            />
                          )}

                        </div>

                      </article>
                    )
                  )}

                </div>
              ) : (
                <div className="mt-7 rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">

                  <Palette
                    size={28}
                    className="mx-auto text-zinc-700"
                  />

                  <h3 className="mt-5 text-xl font-semibold">
                    No work displayed yet.
                  </h3>

                  <p className="mt-2 text-zinc-600">
                    Portfolio pieces will appear here.
                  </p>

                  {isOwnProfile && (
                    <a
                      href="/dashboard/portfolio/new"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium hover:bg-violet-500"
                    >
                      <Plus size={16} />
                      Add First Work
                    </a>
                  )}

                </div>
              )}

            </section>

            {/* PROJECTS */}
            <section className="mt-16">

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
                Original Worlds
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Projects
              </h2>

              <p className="mt-2 text-zinc-500">
                Animation worlds created by this creator.
              </p>

              {projects.length > 0 ? (
                <div className="mt-7 grid gap-5 md:grid-cols-2">

                  {projects.map(
                    (
                      project,
                      index
                    ) => (
                      <CreatorProjectCard
                        key={
                          project.id
                        }
                        project={
                          project
                        }
                        index={
                          index
                        }
                      />
                    )
                  )}

                </div>
              ) : (
                <div className="mt-7 rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">

                  <Clapperboard
                    size={26}
                    className="mx-auto text-zinc-700"
                  />

                  <p className="mt-4 text-zinc-600">
                    No public projects yet.
                  </p>

                </div>
              )}

            </section>

          </div>

        </div>

      </section>

    </main>
  );
}

function ProfileStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4 text-center">

      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {label}
      </p>

    </div>
  );
}

function CreatorProjectCard({
  project,
  index,
}: {
  project: {
    title: string;
    slug: string;
    description: string | null;
    genre: string | null;
    animation_style: string | null;
    status: string;
  };
  index: number;
}) {
  const gradients = [
    "from-violet-500/25 via-fuchsia-500/10 to-blue-500/5",
    "from-blue-500/20 via-violet-500/10 to-transparent",
    "from-fuchsia-500/20 via-orange-500/10 to-transparent",
  ];

  return (
    <a
      href={`/projects/${project.slug}`}
      className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-violet-500/30"
    >

      <div
        className={`relative h-36 bg-gradient-to-br ${
          gradients[
            index %
              gradients.length
          ]
        }`}
      >

        <span className="absolute right-5 top-5 text-5xl font-black text-white/[0.05]">

          {String(
            index + 1
          ).padStart(
            2,
            "0"
          )}

        </span>

      </div>

      <div className="p-6">

        <div className="flex flex-wrap gap-2 text-xs text-zinc-600">

          {project.genre && (
            <span>
              {project.genre}
            </span>
          )}

          {project.genre &&
            project.animation_style && (
              <span>•</span>
            )}

          {project.animation_style && (
            <span>
              {
                project.animation_style
              }
            </span>
          )}

        </div>

        <h3 className="mt-3 text-xl font-bold">
          {project.title}
        </h3>

        {project.description && (
          <p className="mt-3 line-clamp-2 leading-7 text-zinc-500">
            {
              project.description
            }
          </p>
        )}

        <div className="mt-6 flex items-center gap-2 text-sm font-medium text-violet-400">

          Enter world

          <ArrowRight
            size={15}
            className="transition group-hover:translate-x-1"
          />

        </div>

      </div>

    </a>
  );
}
