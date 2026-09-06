"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Palette,
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

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    /*
     * If Confirm Email is OFF,
     * Supabase gives us a session immediately.
     */
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }

    /*
     * If Confirm Email is ever enabled later.
     */
    setMessage(
      "Account created. Check your email to confirm your account."
    );

    setLoading(false);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      <nav className="relative z-20 mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6">

        <AnimForgeLogo />

        <a
          href="/"
          className="text-sm text-zinc-500 transition hover:text-white"
        >
          Back home
        </a>

      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-90px)] max-w-[1400px] gap-12 px-6 pb-16 pt-8 lg:grid-cols-2 lg:items-center">

        {/* CREATIVE SIDE */}
        <div className="hidden lg:block">

          <div className="max-w-xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-300">

              <Sparkles size={15} />

              Join the forge

            </div>

            <h1 className="mt-8 text-6xl font-black leading-[1.02] tracking-[-0.04em]">

              Your ideas
              <br />

              deserve a

              <br />

              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                creative team.
              </span>

            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">
              Build your creator identity, show
              your work and meet the people who
              can help turn your animation ideas
              into something real.
            </p>

          </div>

          <div className="mt-12 grid max-w-xl grid-cols-2 gap-4">

            <CreativeMiniCard
              icon={<Palette size={20} />}
              title="Show your work"
              text="Build your portfolio."
            />

            <CreativeMiniCard
              icon={<Users size={20} />}
              title="Find your team"
              text="Meet other creators."
            />

          </div>

        </div>

        {/* SIGNUP */}
        <div className="mx-auto w-full max-w-md">

          <div className="rounded-[32px] border border-white/10 bg-white/[0.045] p-7 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-9">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300">
              <WandSparkles size={21} />
            </div>

            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-fuchsia-400">
              Become a creator
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight">
              Join AnimForge.
            </h2>

            <p className="mt-3 leading-7 text-zinc-500">
              Your next project, collaborator or
              creative opportunity could start here.
            </p>

            <form
              onSubmit={handleSignUp}
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
                  minLength={6}
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Minimum 6 characters"
                  className={inputStyle}
                />

              </div>

              {message && (
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-sm text-violet-200">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading
                  ? "Creating your studio..."
                  : "Create Account"}

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
                Already part of AnimForge?
              </p>

              <a
                href="/auth/login"
                className="mt-2 inline-block font-medium text-violet-400 hover:text-violet-300"
              >
                Enter your studio →
              </a>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

function CreativeMiniCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-sm text-zinc-500">
        {text}
      </p>

    </div>
  );
}
