"use client";

import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Palette,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";

import {
  ChangeEvent,
  DragEvent,
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

export default function AddPortfolioWorkPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [file, setFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [dragging, setDragging] =
    useState(false);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function chooseFile(selectedFile: File) {
    setMessage("");

    if (
      !selectedFile.type.startsWith(
        "image/"
      )
    ) {
      setMessage(
        "Please choose an image file."
      );
      return;
    }

    if (
      selectedFile.size >
      5 * 1024 * 1024
    ) {
      setMessage(
        "Image must be smaller than 5 MB."
      );
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);

    setPreview(
      URL.createObjectURL(
        selectedFile
      )
    );
  }

  function handleFileChange(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      e.target.files?.[0];

    if (selectedFile) {
      chooseFile(selectedFile);
    }
  }

  function handleDrop(
    e: DragEvent<HTMLDivElement>
  ) {
    e.preventDefault();

    setDragging(false);

    const droppedFile =
      e.dataTransfer.files?.[0];

    if (droppedFile) {
      chooseFile(droppedFile);
    }
  }

  function removeImage() {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(null);
    setPreview(null);
  }

  async function uploadWork(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!title.trim()) {
      setMessage(
        "Give your artwork a title."
      );
      return;
    }

    if (!file) {
      setMessage(
        "Choose an image to upload."
      );
      return;
    }

    setLoading(true);
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

    // Load username for redirect
    const { data: profile } =
      await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

    if (!profile?.username) {
      router.push("/onboarding");
      return;
    }

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const storagePath =
      `${user.id}/${crypto.randomUUID()}.${extension}`;

    // Upload image
    const {
      error: uploadError,
    } =
      await supabase.storage
        .from("portfolio")
        .upload(
          storagePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

    if (uploadError) {
      console.error(
        "UPLOAD ERROR:",
        uploadError
      );

      setMessage(
        uploadError.message
      );

      setLoading(false);
      return;
    }

    // Get public image URL
    const {
      data: publicUrlData,
    } =
      supabase.storage
        .from("portfolio")
        .getPublicUrl(
          storagePath
        );

    const imageUrl =
      publicUrlData.publicUrl;

    // Save portfolio record
    const {
      error: insertError,
    } =
      await supabase
        .from("portfolio_items")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description:
            description.trim() ||
            null,
          image_url: imageUrl,
          storage_path:
            storagePath,
        });

    if (insertError) {
      console.error(
        "PORTFOLIO INSERT ERROR:",
        insertError
      );

      // Clean up uploaded image
      await supabase.storage
        .from("portfolio")
        .remove([
          storagePath,
        ]);

      setMessage(
        insertError.message
      );

      setLoading(false);
      return;
    }

    router.push(
      `/creators/${profile.username}`
    );

    router.refresh();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      {/* NAVBAR */}
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

      <section className="relative z-10 mx-auto grid max-w-[1400px] gap-12 px-6 pb-24 pt-14 lg:grid-cols-[0.72fr_1.28fr]">

        {/* LEFT */}
        <aside className="lg:sticky lg:top-28 lg:self-start">

          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-fuchsia-300">

            <Palette size={15} />

            Your creative archive

          </div>

          <h1 className="mt-8 text-5xl font-black leading-[1.02] tracking-[-0.04em] md:text-6xl">

            Put your work
            <br />
            where creators

            <br />

            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              can discover it.
            </span>

          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-zinc-400">
            Your portfolio is your creative
            identity on AnimForge. Show the work
            that represents your style and skills.
          </p>

          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl">

            <Sparkles className="text-violet-400" />

            <h2 className="mt-5 text-xl font-semibold">
              Portfolio tip
            </h2>

            <p className="mt-3 leading-7 text-zinc-500">
              Upload your strongest work rather
              than everything you've made. A few
              great pieces can communicate your
              style better than dozens of random
              images.
            </p>

          </div>

        </aside>

        {/* MAIN */}
        <form
          onSubmit={uploadWork}
          className="rounded-[34px] border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-10"
        >

          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
            Add Portfolio Work
          </p>

          <h2 className="mt-3 text-3xl font-black">
            Showcase something you've made.
          </h2>

          <p className="mt-3 text-zinc-500">
            Add artwork, character designs,
            backgrounds, animation frames or
            other visual work.
          </p>

          {/* IMAGE UPLOAD */}
          <div className="mt-9">

            <p className="mb-3 text-sm text-zinc-400">
              Artwork
            </p>

            {!preview ? (

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() =>
                  setDragging(false)
                }
                onDrop={handleDrop}
                className={`relative flex min-h-[350px] flex-col items-center justify-center rounded-[30px] border border-dashed p-8 text-center transition ${
                  dragging
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-white/15 bg-black/20 hover:border-violet-500/40 hover:bg-violet-500/[0.03]"
                }`}
              >

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300">

                  <UploadCloud
                    size={28}
                  />

                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  Drop your artwork here
                </h3>

                <p className="mt-2 text-sm text-zinc-600">
                  PNG, JPG, JPEG or WEBP
                  • Maximum 5 MB
                </p>

                <label className="mt-7 cursor-pointer rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]">

                  Choose Image

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleFileChange
                    }
                    className="hidden"
                  />

                </label>

              </div>

            ) : (

              <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/30">

                <img
                  src={preview}
                  alt="Portfolio preview"
                  className="max-h-[600px] w-full object-contain"
                />

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-20">

                  <div>

                    <p className="text-sm font-medium">
                      {file?.name}
                    </p>

                    <p className="mt-1 text-xs text-zinc-400">
                      {file
                        ? (
                            file.size /
                            1024 /
                            1024
                          ).toFixed(2)
                        : "0"}{" "}
                      MB
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={removeImage}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-zinc-300 backdrop-blur-xl transition hover:bg-red-500/20 hover:text-red-300"
                  >
                    <X size={17} />
                  </button>

                </div>

              </div>

            )}

          </div>

          {/* TITLE */}
          <div className="mt-8">

            <label className="mb-2 block text-sm text-zinc-400">
              Work title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              required
              placeholder="Character Exploration — Luna"
              className={inputStyle}
            />

          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">

            <label className="mb-2 block text-sm text-zinc-400">
              Story behind the work
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              rows={5}
              placeholder="Tell other creators what this is, what you worked on, the tools you used or what inspired it..."
              className={`${inputStyle} resize-none`}
            />

          </div>

          {message && (
            <div className="mt-7 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {message}
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-9 flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-7 sm:flex-row sm:items-center sm:justify-between">

            <a
              href="/dashboard"
              className="text-center text-sm text-zinc-500 transition hover:text-white"
            >
              Cancel
            </a>

            <button
              type="submit"
              disabled={
                loading || !file
              }
              className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
            >

              <ImagePlus size={17} />

              {loading
                ? "Adding to portfolio..."
                : "Publish Work"}

              {!loading && (
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
