"use client";

import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import {
  ChangeEvent,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import {
  AnimForgeLogo,
  PageBackground,
  inputStyle,
} from "@/components/animforge/ui";

const availableRoles = [
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

export default function EditProfilePage() {
  const router = useRouter();

  const [username, setUsername] =
    useState("");

  const [displayName, setDisplayName] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [roles, setRoles] =
    useState<string[]>([]);

  const [avatarUrl, setAvatarUrl] =
    useState<string | null>(null);

  const [avatarFile, setAvatarFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadProfile() {
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
        data: profile,
        error,
      } = await supabase
        .from("profiles")
        .select(`
          username,
          display_name,
          bio,
          roles,
          avatar_url
        `)
        .eq("id", user.id)
        .maybeSingle();

      if (error || !profile) {
        setMessage(
          "Could not load your profile."
        );

        setLoading(false);
        return;
      }

      setUsername(
        profile.username || ""
      );

      setDisplayName(
        profile.display_name || ""
      );

      setBio(
        profile.bio || ""
      );

      setRoles(
        profile.roles || []
      );

      setAvatarUrl(
        profile.avatar_url || null
      );

      setLoading(false);
    }

    loadProfile();
  }, [router]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function toggleRole(role: string) {
    setRoles((current) =>
      current.includes(role)
        ? current.filter(
            (item) => item !== role
          )
        : [...current, role]
    );
  }

  function handleAvatar(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      setMessage(
        "Avatar must be JPG, PNG or WEBP."
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setMessage(
        "Avatar must be under 5 MB."
      );
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setAvatarFile(file);

    setPreview(
      URL.createObjectURL(file)
    );

    setMessage("");
  }

  function cancelNewAvatar() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setAvatarFile(null);
  }

  async function saveProfile(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!username.trim()) {
      setMessage(
        "Choose a username."
      );
      return;
    }

    if (roles.length === 0) {
      setMessage(
        "Choose at least one creative role."
      );
      return;
    }

    setSaving(true);
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

    const cleanUsername =
      username
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(
          /[^a-z0-9._-]/g,
          ""
        );

    if (!cleanUsername) {
      setMessage(
        "Invalid username."
      );

      setSaving(false);
      return;
    }

    let finalAvatarUrl =
      avatarUrl;

    if (avatarFile) {
      const extension =
        avatarFile.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const avatarPath =
        `${user.id}/avatar.${extension}`;

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from("avatars")
          .upload(
            avatarPath,
            avatarFile,
            {
              upsert: true,
              contentType:
                avatarFile.type,
              cacheControl: "3600",
            }
          );

      if (uploadError) {
        console.error(
          "AVATAR UPLOAD ERROR:",
          uploadError
        );

        setMessage(
          uploadError.message
        );

        setSaving(false);
        return;
      }

      const {
        data: publicUrl,
      } =
        supabase.storage
          .from("avatars")
          .getPublicUrl(
            avatarPath
          );

      finalAvatarUrl =
        `${publicUrl.publicUrl}?v=${Date.now()}`;
    }

    const {
      error: updateError,
    } =
      await supabase
        .from("profiles")
        .update({
          username:
            cleanUsername,

          display_name:
            displayName.trim() ||
            cleanUsername,

          bio:
            bio.trim() ||
            null,

          roles,

          avatar_url:
            finalAvatarUrl,
        })
        .eq("id", user.id);

    if (updateError) {
      console.error(
        "PROFILE UPDATE ERROR:",
        updateError
      );

      if (
        updateError.message
          .toLowerCase()
          .includes("duplicate")
      ) {
        setMessage(
          "That username is already taken."
        );
      } else {
        setMessage(
          updateError.message
        );
      }

      setSaving(false);
      return;
    }

    router.push(
      `/creators/${cleanUsername}`
    );

    router.refresh();
  }

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060608] text-white">

        <PageBackground />

        <div className="relative z-10 text-center">

          <UserRound
            size={30}
            className="mx-auto text-violet-400"
          />

          <p className="mt-5 text-zinc-500">
            Opening your creator studio...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <a
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ArrowLeft size={16} />
            Dashboard
          </a>

        </div>

      </nav>

      <section className="relative z-10 mx-auto grid max-w-[1400px] gap-12 px-6 pb-24 pt-14 lg:grid-cols-[.7fr_1.3fr]">

        {/* LEFT */}
        <aside className="lg:sticky lg:top-28 lg:self-start">

          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">

            <Sparkles size={15} />

            Creator Identity

          </div>

          <h1 className="mt-8 text-5xl font-black leading-[1.02] tracking-[-0.04em] md:text-6xl">

            Your profile is
            <br />

            your creative
            <br />

            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              signature.
            </span>

          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">
            Show other creators who you are,
            what you create and the skills you
            bring into a production.
          </p>

          <div className="mt-10 rounded-[30px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">

            <p className="text-xs uppercase tracking-[0.18em] text-zinc-600">
              Live Preview
            </p>

            <div className="mt-6 flex items-center gap-4">

              {preview || avatarUrl ? (
                <img
                  src={
                    preview ||
                    avatarUrl ||
                    ""
                  }
                  alt="Avatar"
                  className="h-20 w-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-3xl font-black">

                  {(displayName ||
                    username ||
                    "A")
                    .charAt(0)
                    .toUpperCase()}

                </div>
              )}

              <div className="min-w-0">

                <h2 className="truncate text-xl font-semibold">
                  {displayName ||
                    username ||
                    "Creator"}
                </h2>

                <p className="mt-1 truncate text-sm text-zinc-600">
                  @{username ||
                    "username"}
                </p>

              </div>

            </div>

            {roles.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">

                {roles
                  .slice(0, 4)
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

          </div>

        </aside>

        {/* FORM */}
        <form
          onSubmit={saveProfile}
          className="rounded-[34px] border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-10"
        >

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
            Edit Profile
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Shape your creator identity.
          </h2>

          {/* AVATAR */}
          <section className="mt-9">

            <label className="text-sm text-zinc-400">
              Profile picture
            </label>

            <div className="mt-4 flex flex-col gap-5 rounded-[26px] border border-white/[0.08] bg-black/20 p-6 sm:flex-row sm:items-center">

              {preview || avatarUrl ? (
                <img
                  src={
                    preview ||
                    avatarUrl ||
                    ""
                  }
                  alt="Avatar preview"
                  className="h-24 w-24 rounded-[24px] object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-violet-500/10 text-violet-300">
                  <UserRound
                    size={32}
                  />
                </div>
              )}

              <div>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]">

                  <Camera size={16} />

                  Choose Avatar

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatar}
                    className="hidden"
                  />

                </label>

                {preview && (
                  <button
                    type="button"
                    onClick={
                      cancelNewAvatar
                    }
                    className="ml-3 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-red-300"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                )}

                <p className="mt-3 text-xs text-zinc-600">
                  JPG, PNG or WEBP • Maximum 5 MB
                </p>

              </div>

            </div>

          </section>

          <div className="mt-8 grid gap-5 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Display name
              </label>

              <input
                value={displayName}
                onChange={(e) =>
                  setDisplayName(
                    e.target.value
                  )
                }
                placeholder="Your creative name"
                className={inputStyle}
              />

            </div>

            <div>

              <label className="mb-2 block text-sm text-zinc-400">
                Username
              </label>

              <input
                required
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                placeholder="username"
                className={inputStyle}
              />

            </div>

          </div>

          <div className="mt-6">

            <label className="mb-2 block text-sm text-zinc-400">
              About you
            </label>

            <textarea
              value={bio}
              onChange={(e) =>
                setBio(
                  e.target.value
                )
              }
              rows={6}
              placeholder="Tell creators about your style, experience, interests and projects you want to work on..."
              className={`${inputStyle} resize-none`}
            />

          </div>

          {/* ROLES */}
          <section className="mt-9">

            <p className="text-sm font-medium text-zinc-300">
              Creative roles
            </p>

            <p className="mt-1 text-sm text-zinc-600">
              Choose all the roles that describe your work.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {availableRoles.map(
                (role) => {
                  const selected =
                    roles.includes(
                      role
                    );

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() =>
                        toggleRole(
                          role
                        )
                      }
                      className={`flex items-center justify-between rounded-2xl border p-4 text-left text-sm transition ${
                        selected
                          ? "border-violet-500/40 bg-violet-500/10 text-violet-200"
                          : "border-white/10 bg-black/20 text-zinc-500 hover:border-white/20 hover:text-white"
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
                }
              )}

            </div>

          </section>

          {message && (
            <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {message}
            </div>
          )}

          <div className="mt-9 flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-7 sm:flex-row sm:items-center sm:justify-between">

            <a
              href="/dashboard"
              className="text-center text-sm text-zinc-500 hover:text-white"
            >
              Cancel
            </a>

            <button
              type="submit"
              disabled={saving}
              className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-black transition hover:scale-[1.02] disabled:opacity-40"
            >

              {saving
                ? "Saving profile..."
                : "Save Profile"}

              {!saving && (
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
