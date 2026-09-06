"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Palette,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  AnimForgeLogo,
  PageBackground,
  inputStyle,
} from "@/components/animforge/ui";

const roles = [
  "Animator",
  "Writer",
  "Character Artist",
  "Background Artist",
  "Storyboard Artist",
  "Voice Actor",
  "Music / Sound",
  "Video Editor",
  "Creator",
];

export default function OnboardingPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select(`
          username,
          display_name,
          bio,
          roles
        `)
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.username) {
        router.push("/dashboard");
        return;
      }

      setChecking(false);
    }

    checkUser();
  }, [router]);

  function toggleRole(role: string) {
    setSelectedRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role]
    );
  }

  async function completeProfile(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!username.trim()) {
      setMessage("Choose a username.");
      return;
    }

    if (selectedRoles.length === 0) {
      setMessage(
        "Choose at least one creative role."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const cleanUsername = username
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9._-]/g, "");

    if (!cleanUsername) {
      setMessage(
        "Username can only contain letters, numbers, dots, underscores and dashes."
      );
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        username: cleanUsername,
        display_name:
          displayName.trim() || cleanUsername,
        bio: bio.trim() || null,
        roles: selectedRoles,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);

      if (
        error.message
          .toLowerCase()
          .includes("duplicate")
      ) {
        setMessage(
          "That username is already taken."
        );
      } else {
        setMessage(error.message);
      }

      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (checking) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060608] text-white">

        <PageBackground />

        <div className="relative z-10 text-center">

          <WandSparkles
            size={32}
            className="mx-auto text-violet-400"
          />

          <p className="mt-5 text-zinc-400">
            Preparing your creative studio...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      <nav className="relative z-20 mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6">

        <AnimForgeLogo />

        <span className="text-sm text-zinc-600">
          Creator setup
        </span>

      </nav>

      <section className="relative z-10 mx-auto grid max-w-[1400px] gap-12 px-6 pb-20 pt-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">

        {/* LEFT */}
        <div className="lg:sticky lg:top-28">

          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">

            <Sparkles size={15} />

            Build your creator identity

          </div>

          <h1 className="mt-8 text-5xl font-black leading-[1.02] tracking-[-0.04em] md:text-6xl">

            Who are you
            <br />
            in the
            <br />

            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              animation world?
            </span>

          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">
            Your profile helps other creators
            understand your skills, discover your
            work and invite you into projects.
          </p>

          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">

            <Palette className="text-violet-400" />

            <h2 className="mt-5 text-xl font-semibold">
              Your creator profile
            </h2>

            <p className="mt-3 leading-7 text-zinc-500">
              You can add your portfolio after
              setup and continue improving your
              profile whenever you want.
            </p>

          </div>

        </div>

        {/* FORM */}
        <form
          onSubmit={completeProfile}
          className="rounded-[34px] border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-10"
        >

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
            Step 01
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Create your identity.
          </h2>

          <p className="mt-3 text-zinc-500">
            Tell AnimForge what kind of creator
            you are.
          </p>

          <div className="mt-9 grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Username
              </label>

              <input
                required
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="yourname"
                className={inputStyle}
              />

              <p className="mt-2 text-xs text-zinc-600">
                This becomes your public profile URL.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-400">
                Display name
              </label>

              <input
                value={displayName}
                onChange={(e) =>
                  setDisplayName(e.target.value)
                }
                placeholder="Your creative name"
                className={inputStyle}
              />
            </div>

          </div>

          {/* ROLES */}
          <div className="mt-9">

            <div>
              <p className="text-sm font-medium text-zinc-300">
                What do you create?
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                Choose all roles that describe you.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {roles.map((role) => {
                const selected =
                  selectedRoles.includes(role);

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() =>
                      toggleRole(role)
                    }
                    className={`flex items-center justify-between rounded-2xl border p-4 text-left text-sm transition ${
                      selected
                        ? "border-violet-500/40 bg-violet-500/10 text-violet-200"
                        : "border-white/10 bg-black/20 text-zinc-400 hover:border-white/20 hover:text-white"
                    }`}
                  >

                    {role}

                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        selected
                          ? "border-violet-400 bg-violet-500 text-white"
                          : "border-zinc-700"
                      }`}
                    >
                      {selected && (
                        <Check size={13} />
                      )}
                    </span>

                  </button>
                );
              })}

            </div>

          </div>

          {/* BIO */}
          <div className="mt-9">

            <label className="mb-2 block text-sm text-zinc-400">
              Your story
            </label>

            <textarea
              value={bio}
              onChange={(e) =>
                setBio(e.target.value)
              }
              rows={5}
              placeholder="Tell other creators what you enjoy making, your skills, interests or the kind of projects you want to join..."
              className={`${inputStyle} resize-none`}
            />

          </div>

          {message && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {message}
            </div>
          )}

          <div className="mt-8 flex justify-end">

            <button
              type="submit"
              disabled={loading}
              className="group flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-black transition hover:scale-[1.02] disabled:opacity-50"
            >

              {loading
                ? "Creating your studio..."
                : "Enter AnimForge"}

              {!loading && (
                <ArrowRight
                  size={17}
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
