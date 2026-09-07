"use client";

import {
  ArrowLeft,
  Camera,
  Loader2,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  ChangeEvent,
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import {
  AnimForgeLogo,
  PageBackground,
  inputStyle,
} from "@/components/animforge/ui";

type Project = {
  id: string;
  title: string;
};

type Character = {
  id: string;
  project_id: string;
  created_by: string;

  name: string;

  role: string | null;

  age_profile: string | null;

  personality: string | null;

  goal: string | null;

  flaw: string | null;

  visual_direction: string | null;

  relationship: string | null;

  design_notes: string | null;

  reference_storage_path:
    string | null;

  raw_content: string;

  created_at: string;

  updated_at: string;
};

export default function CharacterProfilePage() {
  const router = useRouter();

  const params =
    useParams<{
      slug: string;
      characterId: string;
    }>();

  const slug =
    decodeURIComponent(
      params.slug
    );

  const characterId =
    params.characterId;

  const [project, setProject] =
    useState<Project | null>(
      null
    );

  const [
    character,
    setCharacter,
  ] =
    useState<Character | null>(
      null
    );

  const [userId, setUserId] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    void loadCharacter();
  }, [
    slug,
    characterId,
  ]);

  async function loadCharacter() {
    setLoading(true);
    setError("");

    const supabase =
      createClient();

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      router.push(
        "/auth/login"
      );

      return;
    }

    setUserId(
      user.id
    );

    const {
      data: projectData,
      error: projectError,
    } =
      await supabase
        .from("projects")
        .select(
          "id, title"
        )
        .eq(
          "slug",
          slug
        )
        .maybeSingle();

    if (
      projectError ||
      !projectData
    ) {
      setError(
        "Project not found or you do not have access."
      );

      setLoading(false);

      return;
    }

    setProject(
      projectData
    );

    const {
      data:
        characterData,
      error:
        characterError,
    } =
      await supabase
        .from(
          "project_characters"
        )
        .select(`
          id,
          project_id,
          created_by,
          name,
          role,
          age_profile,
          personality,
          goal,
          flaw,
          visual_direction,
          relationship,
          design_notes,
          reference_storage_path,
          raw_content,
          created_at,
          updated_at
        `)
        .eq(
          "id",
          characterId
        )
        .eq(
          "project_id",
          projectData.id
        )
        .maybeSingle();

    if (
      characterError ||
      !characterData
    ) {
      setError(
        "Character not found or you do not have access."
      );

      setLoading(false);

      return;
    }

    const row =
      characterData as Character;

    setCharacter(row);

    if (
      row.reference_storage_path
    ) {
      const {
        data:
          signedData,
      } =
        await supabase.storage
          .from(
            "character-references"
          )
          .createSignedUrl(
            row.reference_storage_path,
            3600
          );

      if (
        signedData?.signedUrl
      ) {
        setImageUrl(
          signedData.signedUrl
        );
      }
    }

    setLoading(false);
  }

  function updateField<
    K extends keyof Character
  >(
    field: K,
    value: Character[K]
  ) {
    if (!character) {
      return;
    }

    setCharacter({
      ...character,

      [field]:
        value,
    });

    setSuccess("");
  }

  async function saveCharacter() {
    if (
      !character ||
      saving
    ) {
      return;
    }

    if (
      character.created_by !==
      userId
    ) {
      setError(
        "Only the creator who saved this character can edit it."
      );

      return;
    }

    if (
      !character.name.trim()
    ) {
      setError(
        "Character name cannot be empty."
      );

      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase =
        createClient();

      const {
        error:
          updateError,
      } =
        await supabase
          .from(
            "project_characters"
          )
          .update({
            name:
              character.name.trim(),

            role:
              clean(
                character.role
              ),

            age_profile:
              clean(
                character.age_profile
              ),

            personality:
              clean(
                character.personality
              ),

            goal:
              clean(
                character.goal
              ),

            flaw:
              clean(
                character.flaw
              ),

            visual_direction:
              clean(
                character.visual_direction
              ),

            relationship:
              clean(
                character.relationship
              ),

            design_notes:
              clean(
                character.design_notes
              ),

            raw_content:
              character.raw_content.trim(),

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            character.id
          );

      if (updateError) {
        throw updateError;
      }

      setSuccess(
        "Character profile saved ✓"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save character."
      );
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value =
      "";

    if (
      !file ||
      !character ||
      !project
    ) {
      return;
    }

    if (
      character.created_by !==
      userId
    ) {
      setError(
        "Only the creator who saved this character can change its reference image."
      );

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Use a JPG, PNG or WEBP image."
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Character reference image must be 5 MB or smaller."
      );

      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    const supabase =
      createClient();

    let newPath = "";

    try {
      const extension =
        getExtension(
          file
        );

      newPath =
        `${userId}/${project.id}/${character.id}/${crypto.randomUUID()}.${extension}`;

      const {
        error:
          uploadError,
      } =
        await supabase.storage
          .from(
            "character-references"
          )
          .upload(
            newPath,
            file,
            {
              cacheControl:
                "3600",

              upsert:
                false,

              contentType:
                file.type,
            }
          );

      if (uploadError) {
        throw uploadError;
      }

      const oldPath =
        character.reference_storage_path;

      const {
        error:
          updateError,
      } =
        await supabase
          .from(
            "project_characters"
          )
          .update({
            reference_storage_path:
              newPath,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            character.id
          );

      if (updateError) {
        await supabase.storage
          .from(
            "character-references"
          )
          .remove([
            newPath,
          ]);

        throw updateError;
      }

      if (oldPath) {
        await supabase.storage
          .from(
            "character-references"
          )
          .remove([
            oldPath,
          ]);
      }

      const {
        data:
          signedData,
      } =
        await supabase.storage
          .from(
            "character-references"
          )
          .createSignedUrl(
            newPath,
            3600
          );

      setCharacter({
        ...character,

        reference_storage_path:
          newPath,
      });

      setImageUrl(
        signedData?.signedUrl ||
          ""
      );

      setSuccess(
        "Character reference image updated ✓"
      );
    } catch (err) {
      console.error(
        "CHARACTER IMAGE ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Could not upload image."
      );
    } finally {
      setUploading(false);
    }
  }

  async function removeImage() {
    if (
      !character ||
      !character.reference_storage_path
    ) {
      return;
    }

    if (
      character.created_by !==
      userId
    ) {
      return;
    }

    if (
      !window.confirm(
        "Remove this character reference image?"
      )
    ) {
      return;
    }

    setUploading(true);
    setError("");

    const supabase =
      createClient();

    const oldPath =
      character.reference_storage_path;

    const {
      error:
        updateError,
    } =
      await supabase
        .from(
          "project_characters"
        )
        .update({
          reference_storage_path:
            null,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          character.id
        );

    if (updateError) {
      setError(
        updateError.message
      );

      setUploading(false);

      return;
    }

    await supabase.storage
      .from(
        "character-references"
      )
      .remove([
        oldPath,
      ]);

    setCharacter({
      ...character,

      reference_storage_path:
        null,
    });

    setImageUrl("");

    setSuccess(
      "Reference image removed."
    );

    setUploading(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060608] text-white">

        <Loader2
          size={30}
          className="animate-spin text-violet-400"
        />

      </main>
    );
  }

  const canEdit =
    character?.created_by ===
    userId;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <a
            href={`/projects/${slug}/assets`}
            className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft
              size={16}
            />

            Project Assets
          </a>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[1400px] px-6 pb-24 pt-10">

        {error &&
          !character && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-200">
              {error}
            </div>
          )}

        {character &&
          project && (
            <>
              <div className="grid gap-8 xl:grid-cols-[0.65fr_1.35fr]">

                {/* VISUAL CARD */}

                <aside>

                  <div className="sticky top-8 overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04]">

                    <div className="relative aspect-[4/5] bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-blue-500/10">

                      {imageUrl ? (
                        <img
                          src={
                            imageUrl
                          }
                          alt={
                            character.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">

                          <div className="text-center">

                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/10 bg-black/20 text-violet-300">

                              <UserRound
                                size={34}
                              />

                            </div>

                            <p className="mt-5 text-sm text-zinc-600">
                              No reference image
                            </p>

                          </div>

                        </div>
                      )}

                    </div>

                    <div className="p-6">

                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-400">
                        Character
                      </p>

                      <h1 className="mt-2 text-3xl font-black">
                        {
                          character.name
                        }
                      </h1>

                      {character.role && (
                        <p className="mt-2 text-violet-300">
                          {
                            character.role
                          }
                        </p>
                      )}

                      {canEdit && (
                        <div className="mt-6 space-y-3">

                          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black">

                            {uploading ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Camera
                                size={16}
                              />
                            )}

                            {uploading
                              ? "Uploading..."
                              : imageUrl
                              ? "Change Reference Image"
                              : "Add Reference Image"}

                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              disabled={
                                uploading
                              }
                              onChange={
                                uploadImage
                              }
                              className="hidden"
                            />

                          </label>

                          {imageUrl && (
                            <button
                              type="button"
                              disabled={
                                uploading
                              }
                              onClick={
                                removeImage
                              }
                              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 px-5 py-3 text-sm text-red-300"
                            >
                              <Trash2
                                size={15}
                              />

                              Remove Image
                            </button>
                          )}

                        </div>
                      )}

                    </div>

                  </div>

                </aside>

                {/* PROFILE */}

                <div>

                  <div className="rounded-[34px] border border-white/10 bg-white/[0.035] p-7 md:p-9">

                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                      {
                        project.title
                      }
                    </p>

                    <h2 className="mt-3 text-4xl font-black">
                      Character Profile
                    </h2>

                    {!canEdit && (
                      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-500">
                        You can view this character, but only the creator who saved it can edit it.
                      </div>
                    )}

                    {error && (
                      <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
                        {success}
                      </div>
                    )}

                    <div className="mt-8 grid gap-5 md:grid-cols-2">

                      <ProfileInput
                        label="Name"
                        value={
                          character.name
                        }
                        disabled={
                          !canEdit
                        }
                        onChange={(
                          value
                        ) =>
                          updateField(
                            "name",
                            value
                          )
                        }
                      />

                      <ProfileInput
                        label="Role"
                        value={
                          character.role ||
                          ""
                        }
                        disabled={
                          !canEdit
                        }
                        onChange={(
                          value
                        ) =>
                          updateField(
                            "role",
                            value
                          )
                        }
                      />

                      <ProfileInput
                        label="Age / Profile"
                        value={
                          character.age_profile ||
                          ""
                        }
                        disabled={
                          !canEdit
                        }
                        onChange={(
                          value
                        ) =>
                          updateField(
                            "age_profile",
                            value
                          )
                        }
                      />

                      <ProfileInput
                        label="Personality"
                        value={
                          character.personality ||
                          ""
                        }
                        disabled={
                          !canEdit
                        }
                        onChange={(
                          value
                        ) =>
                          updateField(
                            "personality",
                            value
                          )
                        }
                      />

                      <ProfileInput
                        label="Goal"
                        value={
                          character.goal ||
                          ""
                        }
                        disabled={
                          !canEdit
                        }
                        onChange={(
                          value
                        ) =>
                          updateField(
                            "goal",
                            value
                          )
                        }
                      />

                      <ProfileInput
                        label="Flaw"
                        value={
                          character.flaw ||
                          ""
                        }
                        disabled={
                          !canEdit
                        }
                        onChange={(
                          value
                        ) =>
                          updateField(
                            "flaw",
                            value
                          )
                        }
                      />

                    </div>

                    <ProfileTextarea
                      label="Visual Direction"
                      value={
                        character.visual_direction ||
                        ""
                      }
                      disabled={
                        !canEdit
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "visual_direction",
                          value
                        )
                      }
                    />

                    <ProfileTextarea
                      label="Relationships"
                      value={
                        character.relationship ||
                        ""
                      }
                      disabled={
                        !canEdit
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "relationship",
                          value
                        )
                      }
                    />

                    <ProfileTextarea
                      label="Design Notes"
                      value={
                        character.design_notes ||
                        ""
                      }
                      disabled={
                        !canEdit
                      }
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "design_notes",
                          value
                        )
                      }
                      placeholder="Colors, silhouette, costume variations, expressions, animation details..."
                    />

                    <ProfileTextarea
                      label="Full Character Sheet"
                      value={
                        character.raw_content
                      }
                      disabled={
                        !canEdit
                      }
                      rows={22}
                      onChange={(
                        value
                      ) =>
                        updateField(
                          "raw_content",
                          value
                        )
                      }
                    />

                    {canEdit && (
                      <button
                        type="button"
                        disabled={
                          saving
                        }
                        onClick={
                          saveCharacter
                        }
                        className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-500 px-6 py-4 font-bold transition hover:bg-violet-400 disabled:opacity-40"
                      >

                        {saving ? (
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <Save
                            size={18}
                          />
                        )}

                        {saving
                          ? "Saving..."
                          : "Save Character Profile"}

                      </button>
                    )}

                  </div>

                </div>

              </div>
            </>
          )}

      </section>

    </main>
  );
}

function ProfileInput({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;

  value: string;

  disabled: boolean;

  onChange:
    (
      value: string
    ) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm text-zinc-500">
        {label}
      </label>

      <input
        value={value}
        disabled={
          disabled
        }
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className={`${inputStyle} disabled:cursor-default disabled:opacity-70`}
      />

    </div>
  );
}

function ProfileTextarea({
  label,
  value,
  disabled,
  onChange,
  rows = 5,
  placeholder = "",
}: {
  label: string;

  value: string;

  disabled: boolean;

  onChange:
    (
      value: string
    ) => void;

  rows?: number;

  placeholder?: string;
}) {
  return (
    <div className="mt-5">

      <label className="mb-2 block text-sm text-zinc-500">
        {label}
      </label>

      <textarea
        value={value}
        disabled={
          disabled
        }
        rows={rows}
        placeholder={
          placeholder
        }
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        className={`${inputStyle} resize-y disabled:cursor-default disabled:opacity-70`}
      />

    </div>
  );
}

function clean(
  value:
    string | null
) {
  const cleaned =
    value?.trim();

  return cleaned ||
    null;
}

function getExtension(
  file: File
) {
  if (
    file.type ===
    "image/png"
  ) {
    return "png";
  }

  if (
    file.type ===
    "image/webp"
  ) {
    return "webp";
  }

  return "jpg";
}
