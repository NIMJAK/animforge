import { NextResponse } from "next/server";

import {
  createClient as createAdminClient,
} from "@supabase/supabase-js";

import {
  createClient as createServerClient,
} from "@/lib/supabase/server";

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      projectId: string;
    }>;
  }
) {
  try {
    const { projectId } =
      await context.params;

    const body =
      await request.json();

    if (
      body?.confirmation !==
      "DELETE"
    ) {
      return NextResponse.json(
        {
          error:
            "Type DELETE to confirm.",
        },
        {
          status: 400,
        }
      );
    }

    // Verify signed-in user
    const supabase =
      await createServerClient();

    const {
      data: { user },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL;

    const secretKey =
      process.env
        .SUPABASE_SECRET_KEY;

    if (
      !supabaseUrl ||
      !secretKey
    ) {
      return NextResponse.json(
        {
          error:
            "Project deletion is temporarily unavailable.",
        },
        {
          status: 500,
        }
      );
    }

    const admin =
      createAdminClient(
        supabaseUrl,
        secretKey,
        {
          auth: {
            autoRefreshToken:
              false,
            persistSession:
              false,
          },
        }
      );

    // Verify ownership
    const {
      data: project,
      error:
        projectError,
    } =
      await admin
        .from("projects")
        .select(
          "id, owner_id, title"
        )
        .eq(
          "id",
          projectId
        )
        .maybeSingle();

    if (
      projectError ||
      !project
    ) {
      return NextResponse.json(
        {
          error:
            "Project not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      project.owner_id !==
      user.id
    ) {
      return NextResponse.json(
        {
          error:
            "Only the project owner can delete this project.",
        },
        {
          status: 403,
        }
      );
    }

    // Find character reference images
    const {
      data: characters,
    } =
      await admin
        .from(
          "project_characters"
        )
        .select(
          "reference_storage_path"
        )
        .eq(
          "project_id",
          projectId
        );

    const paths =
      (
        characters || []
      )
        .map(
          (character) =>
            character.reference_storage_path
        )
        .filter(
          (
            path
          ): path is string =>
            Boolean(path)
        );

    if (
      paths.length > 0
    ) {
      const {
        error:
          storageError,
      } =
        await admin.storage
          .from(
            "character-references"
          )
          .remove(paths);

      if (
        storageError
      ) {
        console.warn(
          "Could not remove some character images:",
          storageError.message
        );
      }
    }

    // Delete project.
    // Related DB rows cascade automatically.
    const {
      error:
        deleteError,
    } =
      await admin
        .from("projects")
        .delete()
        .eq(
          "id",
          projectId
        );

    if (
      deleteError
    ) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE PROJECT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not delete project.",
      },
      {
        status: 500,
      }
    );
  }
}
