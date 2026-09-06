"use client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clapperboard,
  LayoutDashboard,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import {
  AnimForgeLogo,
  PageBackground,
  inputStyle,
} from "@/components/animforge/ui";

type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "review"
  | "completed";

type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_by: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
};

type TeamMember = {
  id: string;
  name: string;
  username: string | null;
  role: string;
};

const columns: {
  status: TaskStatus;
  title: string;
  subtitle: string;
}[] = [
  {
    status: "backlog",
    title: "Backlog",
    subtitle: "Ideas waiting",
  },
  {
    status: "todo",
    title: "To Do",
    subtitle: "Ready to start",
  },
  {
    status: "in_progress",
    title: "In Progress",
    subtitle: "Currently creating",
  },
  {
    status: "review",
    title: "Review",
    subtitle: "Needs feedback",
  },
  {
    status: "completed",
    title: "Completed",
    subtitle: "Finished work",
  },
];

export default function TaskBoardPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const slug = decodeURIComponent(params.slug);

  const [projectId, setProjectId] = useState("");
  const [projectTitle, setProjectTitle] = useState("");

  const [currentUserId, setCurrentUserId] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] =
    useState<TeamMember[]>([]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] =
    useState("");

  const [newAssignedTo, setNewAssignedTo] =
    useState("");

  const [newDueDate, setNewDueDate] =
    useState("");

  const [filter, setFilter] =
    useState<"all" | "mine">("all");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadBoard() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setCurrentUserId(user.id);

      // PROJECT
      const {
        data: project,
        error: projectError,
      } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          owner_id
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (
        projectError ||
        !project
      ) {
        setMessage(
          "Project not found or you do not have access."
        );

        setLoading(false);
        return;
      }

      setProjectId(project.id);
      setProjectTitle(project.title);

      // OWNER PROFILE
      const {
        data: ownerProfile,
      } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          display_name
        `)
        .eq(
          "id",
          project.owner_id
        )
        .maybeSingle();

      const team: TeamMember[] = [
        {
          id: project.owner_id,
          name:
            ownerProfile?.display_name ||
            ownerProfile?.username ||
            "Project Owner",

          username:
            ownerProfile?.username ||
            null,

          role: "Project Owner",
        },
      ];

      // ACCEPTED TEAM MEMBERS
      const {
        data: memberRows,
      } = await supabase
        .from("project_members")
        .select(`
          user_id,
          role_title
        `)
        .eq(
          "project_id",
          project.id
        );

      const memberIds =
        memberRows?.map(
          (member) =>
            member.user_id
        ) || [];

      if (
        memberIds.length > 0
      ) {
        const {
          data: memberProfiles,
        } = await supabase
          .from("profiles")
          .select(`
            id,
            username,
            display_name
          `)
          .in(
            "id",
            memberIds
          );

        memberRows?.forEach(
          (member) => {
            const profile =
              memberProfiles?.find(
                (item) =>
                  item.id ===
                  member.user_id
              );

            team.push({
              id: member.user_id,

              name:
                profile?.display_name ||
                profile?.username ||
                "AnimForge Creator",

              username:
                profile?.username ||
                null,

              role:
                member.role_title,
            });
          }
        );
      }

      setTeamMembers(team);

      // TASKS
      const {
        data: taskData,
        error: taskError,
      } = await supabase
        .from("tasks")
        .select(`
          id,
          project_id,
          title,
          description,
          status,
          created_by,
          assigned_to,
          due_date,
          created_at
        `)
        .eq(
          "project_id",
          project.id
        )
        .order("created_at", {
          ascending: true,
        });

      if (taskError) {
        console.error(
          "TASK LOAD ERROR:",
          taskError
        );

        setMessage(
          "Could not load the project board."
        );

        setLoading(false);
        return;
      }

      setTasks(taskData || []);
      setLoading(false);
    }

    loadBoard();
  }, [router, slug]);

  async function createTask(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!newTaskTitle.trim()) {
      setMessage(
        "Enter a task title."
      );
      return;
    }

    setCreating(true);
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

    const {
      data,
      error,
    } = await supabase
      .from("tasks")
      .insert({
        project_id:
          projectId,

        title:
          newTaskTitle.trim(),

        description:
          newTaskDescription.trim() ||
          null,

        status: "backlog",

        created_by:
          user.id,

        assigned_to:
          newAssignedTo ||
          null,

        due_date:
          newDueDate ||
          null,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "CREATE TASK ERROR:",
        error
      );

      setMessage(
        error.message ||
        "Could not create task."
      );

      setCreating(false);
      return;
    }

    setTasks(
      (current) => [
        ...current,
        data,
      ]
    );

    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewAssignedTo("");
    setNewDueDate("");

    setCreating(false);
  }

  async function changeStatus(
    taskId: string,
    status: TaskStatus
  ) {
    const supabase =
      createClient();

    const { error } =
      await supabase
        .from("tasks")
        .update({
          status,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", taskId);

    if (error) {
      setMessage(
        error.message
      );
      return;
    }

    setTasks(
      (current) =>
        current.map(
          (task) =>
            task.id === taskId
              ? {
                  ...task,
                  status,
                }
              : task
        )
    );
  }

  async function changeAssignee(
    taskId: string,
    assignedTo: string
  ) {
    const supabase =
      createClient();

    const { error } =
      await supabase
        .from("tasks")
        .update({
          assigned_to:
            assignedTo ||
            null,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", taskId);

    if (error) {
      setMessage(
        error.message
      );
      return;
    }

    setTasks(
      (current) =>
        current.map(
          (task) =>
            task.id === taskId
              ? {
                  ...task,
                  assigned_to:
                    assignedTo ||
                    null,
                }
              : task
        )
    );
  }

  async function changeDueDate(
    taskId: string,
    dueDate: string
  ) {
    const supabase =
      createClient();

    const { error } =
      await supabase
        .from("tasks")
        .update({
          due_date:
            dueDate ||
            null,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", taskId);

    if (error) {
      setMessage(
        error.message
      );
      return;
    }

    setTasks(
      (current) =>
        current.map(
          (task) =>
            task.id === taskId
              ? {
                  ...task,
                  due_date:
                    dueDate ||
                    null,
                }
              : task
        )
    );
  }

  async function deleteTask(
    taskId: string
  ) {
    if (
      !window.confirm(
        "Delete this task?"
      )
    ) {
      return;
    }

    const supabase =
      createClient();

    const { error } =
      await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

    if (error) {
      setMessage(
        error.message
      );
      return;
    }

    setTasks(
      (current) =>
        current.filter(
          (task) =>
            task.id !== taskId
        )
    );
  }

  function getMember(
    userId: string | null
  ) {
    if (!userId) {
      return null;
    }

    return (
      teamMembers.find(
        (member) =>
          member.id === userId
      ) || null
    );
  }

  const visibleTasks =
    useMemo(
      () =>
        filter === "mine"
          ? tasks.filter(
              (task) =>
                task.assigned_to ===
                currentUserId
            )
          : tasks,
      [
        tasks,
        filter,
        currentUserId,
      ]
    );

  const completedCount =
    tasks.filter(
      (task) =>
        task.status ===
        "completed"
    ).length;

  const inProgressCount =
    tasks.filter(
      (task) =>
        task.status ===
        "in_progress"
    ).length;

  const reviewCount =
    tasks.filter(
      (task) =>
        task.status ===
        "review"
    ).length;

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060608] text-white">

        <PageBackground />

        <div className="relative z-10 text-center">

          <Clapperboard
            size={32}
            className="mx-auto text-violet-400"
          />

          <p className="mt-5 text-zinc-500">
            Opening production workspace...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] text-white">

      <PageBackground />

      {/* NAVBAR */}
      <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">

        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5">

          <AnimForgeLogo />

          <div className="flex items-center gap-2">

            <a
              href={`/projects/${slug}`}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.05] hover:text-white"
            >
              <ArrowLeft size={16} />
              Project
            </a>

            <a
              href="/dashboard"
              className="hidden rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.07] sm:block"
            >
              Dashboard
            </a>

          </div>

        </div>

      </nav>

      <section className="relative z-10 mx-auto max-w-[1600px] px-6 pb-24 pt-10">

        {/* HERO */}
        <div className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl md:p-10">

          <div className="absolute right-[-130px] top-[-140px] h-[420px] w-[420px] rounded-full bg-violet-500/20 blur-[140px]" />

          <div className="absolute bottom-[-180px] left-[30%] h-[360px] w-[360px] rounded-full bg-fuchsia-500/10 blur-[130px]" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_.75fr] lg:items-end">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">

                <LayoutDashboard size={15} />

                Production Workspace

              </div>

              <h1 className="mt-6 text-4xl font-black tracking-[-0.035em] md:text-5xl">

                {projectTitle}

              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">
                Plan scenes, assign creative work,
                track reviews and move production
                from idea to final frame.
              </p>

            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-3">

              <BoardStat
                value={tasks.length}
                label="Tasks"
              />

              <BoardStat
                value={inProgressCount}
                label="Creating"
              />

              <BoardStat
                value={completedCount}
                label="Finished"
              />

            </div>

          </div>

        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 text-sm text-violet-200">
            {message}
          </div>
        )}

        {/* CONTROL ROW */}
        <div className="mt-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

          {/* FILTER */}
          <div className="flex w-fit rounded-2xl border border-white/10 bg-white/[0.03] p-1">

            <button
              type="button"
              onClick={() =>
                setFilter("all")
              }
              className={`rounded-xl px-5 py-2.5 text-sm transition ${
                filter === "all"
                  ? "bg-white text-black"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              All Tasks
            </button>

            <button
              type="button"
              onClick={() =>
                setFilter("mine")
              }
              className={`rounded-xl px-5 py-2.5 text-sm transition ${
                filter === "mine"
                  ? "bg-white text-black"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              My Tasks
            </button>

          </div>

          {/* TEAM */}
          <div className="flex items-center gap-3">

            <Users
              size={17}
              className="text-zinc-600"
            />

            <div className="flex -space-x-2">

              {teamMembers
                .slice(0, 5)
                .map((member) => (

                  <div
                    key={member.id}
                    title={`${member.name} — ${member.role}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#08080c] bg-violet-500/20 text-xs font-bold text-violet-200"
                  >
                    {member.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                ))}

            </div>

            <span className="text-sm text-zinc-600">
              {teamMembers.length} creators
            </span>

          </div>

        </div>

        {/* CREATE TASK */}
        <form
          onSubmit={createTask}
          className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl md:p-7"
        >

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
              <Plus size={19} />
            </div>

            <div>
              <h2 className="font-semibold">
                Add Production Task
              </h2>

              <p className="mt-1 text-sm text-zinc-600">
                Add something the team needs to create.
              </p>
            </div>

          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-4">

            <div className="lg:col-span-2">

              <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">
                Task
              </label>

              <input
                value={newTaskTitle}
                onChange={(e) =>
                  setNewTaskTitle(
                    e.target.value
                  )
                }
                placeholder="Animate Scene 03"
                className={inputStyle}
              />

            </div>

            <div>

              <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">
                Assign Creator
              </label>

              <select
                value={newAssignedTo}
                onChange={(e) =>
                  setNewAssignedTo(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-[#0b0b10] px-4 py-3 text-white outline-none focus:border-violet-500/50"
              >

                <option value="">
                  Assign later
                </option>

                {teamMembers.map(
                  (member) => (
                    <option
                      key={member.id}
                      value={member.id}
                    >
                      {member.name} — {member.role}
                    </option>
                  )
                )}

              </select>

            </div>

            <div>

              <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-600">
                Due Date
              </label>

              <input
                type="date"
                value={newDueDate}
                onChange={(e) =>
                  setNewDueDate(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-[#0b0b10] px-4 py-3 text-white outline-none focus:border-violet-500/50"
              />

            </div>

          </div>

          <div className="mt-4">

            <textarea
              value={newTaskDescription}
              onChange={(e) =>
                setNewTaskDescription(
                  e.target.value
                )
              }
              rows={3}
              placeholder="Add notes, scene details, references or instructions..."
              className={`${inputStyle} resize-none`}
            />

          </div>

          <div className="mt-5 flex justify-end">

            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 font-semibold text-black transition hover:scale-[1.02] disabled:opacity-40"
            >
              <Plus size={17} />

              {creating
                ? "Adding task..."
                : "Add to Production"}
            </button>

          </div>

        </form>

        {/* PRODUCTION BOARD */}
        <section className="mt-10">

          <div className="flex items-end justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400">
                Production Flow
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Creative Board
              </h2>

            </div>

            {reviewCount > 0 && (
              <div className="hidden items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm text-orange-300 sm:flex">

                <CircleDot size={14} />

                {reviewCount} waiting for review

              </div>
            )}

          </div>

          <div className="mt-7 overflow-x-auto pb-8">

            <div className="grid min-w-[1500px] grid-cols-5 gap-5">

              {columns.map(
                (column) => {
                  const columnTasks =
                    visibleTasks.filter(
                      (task) =>
                        task.status ===
                        column.status
                    );

                  return (
                    <div
                      key={column.status}
                      className="rounded-[28px] border border-white/[0.07] bg-black/20 p-4 backdrop-blur-xl"
                    >

                      {/* COLUMN HEADER */}
                      <div className="flex items-start justify-between px-1">

                        <div>

                          <h3 className="font-semibold">
                            {column.title}
                          </h3>

                          <p className="mt-1 text-xs text-zinc-700">
                            {column.subtitle}
                          </p>

                        </div>

                        <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-500">
                          {columnTasks.length}
                        </span>

                      </div>

                      {/* TASKS */}
                      <div className="mt-5 space-y-4">

                        {columnTasks.map(
                          (task) => {
                            const member =
                              getMember(
                                task.assigned_to
                              );

                            return (
                              <TaskCard
                                key={task.id}
                                task={task}
                                member={member}
                                teamMembers={
                                  teamMembers
                                }
                                onStatus={
                                  changeStatus
                                }
                                onAssignee={
                                  changeAssignee
                                }
                                onDueDate={
                                  changeDueDate
                                }
                                onDelete={
                                  deleteTask
                                }
                              />
                            );
                          }
                        )}

                        {columnTasks.length === 0 && (
                          <div className="rounded-[22px] border border-dashed border-white/[0.07] px-5 py-10 text-center">

                            <Sparkles
                              size={19}
                              className="mx-auto text-zinc-800"
                            />

                            <p className="mt-3 text-xs text-zinc-700">
                              Nothing here yet
                            </p>

                          </div>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </section>

      </section>

    </main>
  );
}

function TaskCard({
  task,
  member,
  teamMembers,
  onStatus,
  onAssignee,
  onDueDate,
  onDelete,
}: {
  task: Task;

  member: TeamMember | null;

  teamMembers: TeamMember[];

  onStatus: (
    taskId: string,
    status: TaskStatus
  ) => void;

  onAssignee: (
    taskId: string,
    userId: string
  ) => void;

  onDueDate: (
    taskId: string,
    date: string
  ) => void;

  onDelete: (
    taskId: string
  ) => void;
}) {
  return (
    <article className="group rounded-[24px] border border-white/[0.08] bg-[#111116] p-5 transition hover:border-violet-500/25">

      {/* TOP */}
      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <h4 className="font-semibold leading-6">
            {task.title}
          </h4>

          {task.description && (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600">
              {task.description}
            </p>
          )}

        </div>

        <StatusDot
          status={task.status}
        />

      </div>

      {/* ASSIGNEE */}
      <div className="mt-5">

        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
          Creator
        </p>

        <div className="mt-3 flex items-center gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-xs font-bold text-violet-300">

            {member
              ? member.name
                  .charAt(0)
                  .toUpperCase()
              : (
                <UserRound
                  size={15}
                />
              )}

          </div>

          <div className="min-w-0">

            <p className="truncate text-sm font-medium text-zinc-300">
              {member
                ? member.name
                : "Unassigned"}
            </p>

            {member && (
              <p className="mt-0.5 truncate text-xs text-zinc-700">
                {member.role}
              </p>
            )}

          </div>

        </div>

        <select
          value={
            task.assigned_to ||
            ""
          }
          onChange={(e) =>
            onAssignee(
              task.id,
              e.target.value
            )
          }
          className="mt-3 w-full rounded-xl border border-white/[0.08] bg-[#09090d] px-3 py-2.5 text-xs text-zinc-400 outline-none transition focus:border-violet-500/40"
        >

          <option value="">
            Unassigned
          </option>

          {teamMembers.map(
            (teamMember) => (
              <option
                key={teamMember.id}
                value={teamMember.id}
              >
                {teamMember.name}
              </option>
            )
          )}

        </select>

      </div>

      {/* DEADLINE */}
      <div className="mt-5">

        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700">

          <CalendarDays
            size={12}
          />

          Deadline

        </div>

        <input
          type="date"
          value={
            task.due_date ||
            ""
          }
          onChange={(e) =>
            onDueDate(
              task.id,
              e.target.value
            )
          }
          className="mt-3 w-full rounded-xl border border-white/[0.08] bg-[#09090d] px-3 py-2.5 text-xs text-zinc-400 outline-none focus:border-violet-500/40"
        />

      </div>

      {/* STATUS */}
      <div className="mt-5">

        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
          Production Stage
        </p>

        <select
          value={task.status}
          onChange={(e) =>
            onStatus(
              task.id,
              e.target.value as TaskStatus
            )
          }
          className="mt-3 w-full rounded-xl border border-white/[0.08] bg-[#09090d] px-3 py-2.5 text-xs text-zinc-400 outline-none focus:border-violet-500/40"
        >

          <option value="backlog">
            Backlog
          </option>

          <option value="todo">
            To Do
          </option>

          <option value="in_progress">
            In Progress
          </option>

          <option value="review">
            Review
          </option>

          <option value="completed">
            Completed
          </option>

        </select>

      </div>

      {/* FOOTER */}
      <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">

        <div className="flex items-center gap-2 text-xs text-zinc-700">

          {task.status ===
          "completed" ? (
            <>
              <CheckCircle2
                size={14}
                className="text-green-400"
              />
              Finished
            </>
          ) : (
            <>
              <Clapperboard
                size={14}
              />
              Production
            </>
          )}

        </div>

        <button
          type="button"
          onClick={() =>
            onDelete(task.id)
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 size={14} />
        </button>

      </div>

    </article>
  );
}

function StatusDot({
  status,
}: {
  status: TaskStatus;
}) {
  const styles: Record<
    TaskStatus,
    string
  > = {
    backlog:
      "bg-zinc-500",

    todo:
      "bg-blue-400",

    in_progress:
      "bg-violet-400",

    review:
      "bg-orange-400",

    completed:
      "bg-green-400",
  };

  return (
    <span
      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${styles[status]}`}
    />
  );
}

function BoardStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl">

      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {label}
      </p>

    </div>
  );
}
