"use client";

import Link from "next/link";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Clapperboard,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import {
  AnimForgeLogo,
  PageBackground,
  inputStyle,
} from "@/components/animforge/ui";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Login failed. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.username) {
      router.push("/onboarding");
    } else {
      router.push("/dashboard");
    }

    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      {/* TOP */}
      <nav className="relative z-20 mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6">
        <AnimForgeLogo />

        <Link
          href="/"
          className="text-sm text-zinc-500 transition hover:text-white"
        >
          Back home
        </Link>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-90px)] max-w-[1400px] gap-12 px-6 pb-16 pt-8 lg:grid-cols-2 lg:items-center">

        {/* LEFT ART PANEL */}
        <div className="hidden lg:block">

          <div className="max-w-xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
              <Sparkles size={15} />
              Your creative universe
            </div>

            <h1 className="mt-8 text-6xl font-black leading-[1.02] tracking-[-0.04em]">

              Continue
              <br />

              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                forging worlds.
              </span>

            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">
              Return to your projects, teams,
              portfolios and animation workspace.
            </p>

          </div>

          {/* DECORATIVE STUDIO CARD */}
          <div className="relative mt-12 max-w-lg rotate-[-2deg] rounded-[32px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">

            <div className="rounded-[25px] border border-white/[0.07] bg-black/30 p-6">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-violet-400">
                    AnimForge Studio
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    The Last Sky
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300">
                  <Clapperboard size={22} />
                </div>

              </div>

              <div className="relative mt-6 h-44 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/25 via-fuchsia-500/10 to-blue-500/10">

                <div className="absolute right-[15%] top-[20%] h-24 w-24 rounded-full border border-white/10 bg-white/[0.03]" />

                <div className="absolute bottom-[-40px] left-[10%] h-36 w-36 rounded-full bg-fuchsia-500/10" />

              </div>

              <div className="mt-5 flex items-center gap-2 text-sm text-zinc-500">
                <Users size={16} />
                5 creators building together
              </div>

            </div>

          </div>

        </div>

        {/* LOGIN CARD */}
        <div className="mx-auto w-full max-w-md">

          <div className="rounded-[32px] border border-white/10 bg-white/[0.045] p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
              <WandSparkles size={21} />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Welcome back
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Enter your studio.
            </h2>

            <p className="mt-3 text-zinc-500">
              Log in to continue creating with
              AnimForge.
            </p>

            <form
              onSubmit={handleLogin}
              className="mt-8 space-y-5"
            >

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Email
                </label>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-400">
                  Password
                </label>

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Your password"
                  className={inputStyle}
                />
              </div>

              {message && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Entering AnimForge..."
                  : "Log In"}

                {!loading && (
                  <ArrowRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                )}
              </button>

            </form>

            <div className="mt-7 border-t border-white/[0.07] pt-6 text-center">

              <p className="text-sm text-zinc-500">
                New to AnimForge?
              </p>

              <a
                href="/auth/sign-up"
                className="mt-2 inline-block font-medium text-violet-400 hover:text-violet-300"
              >
                Create your creator account →
              </a>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
