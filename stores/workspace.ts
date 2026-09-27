import { defineStore } from "pinia";
import { filterTasks, type Project, type Task } from "~/shared/domain";
export const useWorkspaceStore = defineStore("workspace", () => {
  const projects = ref<Project[]>([]),
    tasks = ref<Task[]>([]);
  const loading = ref(false),
    error = ref(""),
    pending = ref<string[]>([]);
  const query = ref(""),
    projectId = ref(""),
    status = ref(""),
    tag = ref("");
  const view = ref<"board" | "list">("board");
  const filtered = computed(() =>
    filterTasks(tasks.value, {
      query: query.value,
      projectId: projectId.value,
      status: status.value,
      tag: tag.value,
    }),
  );
  const tags = computed(() =>
    [...new Set(tasks.value.flatMap((t) => t.tags))].sort(),
  );
  function restorePrefs() {
    try {
      const value = localStorage.getItem("taskly-view");
      if (value === "list" || value === "board") view.value = value;
    } catch {}
  }
  function setView(value: "board" | "list") {
    view.value = value;
    try {
      localStorage.setItem("taskly-view", value);
    } catch {}
  }
  async function load() {
    loading.value = true;
    error.value = "";
    try {
      const data = await $fetch<{ projects: Project[]; tasks: Task[] }>(
        "/api/workspace",
      );
      projects.value = data.projects;
      tasks.value = data.tasks;
    } catch {
      error.value = "Could not load your workspace. Please retry.";
    } finally {
      loading.value = false;
    }
  }
  async function saveTask(body: Omit<Task, "id">, id?: string) {
    const task = await $fetch<Task>(id ? `/api/tasks/${id}` : "/api/tasks", {
      method: id ? "PUT" : "POST",
      body,
    });
    if (id) tasks.value = tasks.value.map((t) => (t.id === id ? task : t));
    else tasks.value.push(task);
  }
  async function deleteTask(id: string) {
    await $fetch(`/api/tasks/${id}`, { method: "DELETE" });
    tasks.value = tasks.value.filter((t) => t.id !== id);
  }
  async function saveProject(body: Omit<Project, "id">, id?: string) {
    const project = await $fetch<Project>(
      id ? `/api/projects/${id}` : "/api/projects",
      { method: id ? "PUT" : "POST", body },
    );
    if (id)
      projects.value = projects.value.map((p) => (p.id === id ? project : p));
    else projects.value.push(project);
  }
  async function deleteProject(id: string) {
    await $fetch(`/api/projects/${id}`, { method: "DELETE" });
    projects.value = projects.value.filter((p) => p.id !== id);
    tasks.value = tasks.value.filter((t) => t.projectId !== id);
    if (projectId.value === id) projectId.value = "";
  }
  async function toggle(task: Task) {
    if (pending.value.includes(task.id)) return;
    const previous = task.status;
    task.status = previous === "done" ? "todo" : "done";
    pending.value.push(task.id);
    error.value = "";
    try {
      await $fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        body: { ...task },
      });
    } catch {
      task.status = previous;
      error.value = "Could not update task. Your change was rolled back.";
    } finally {
      pending.value = pending.value.filter((id) => id !== task.id);
    }
  }
  function clearFilters() {
    query.value = "";
    projectId.value = "";
    status.value = "";
    tag.value = "";
  }
  function clear() {
    projects.value = [];
    tasks.value = [];
    error.value = "";
    clearFilters();
  }
  return {
    projects,
    tasks,
    loading,
    error,
    pending,
    query,
    projectId,
    status,
    tag,
    view,
    filtered,
    tags,
    restorePrefs,
    setView,
    load,
    saveTask,
    deleteTask,
    saveProject,
    deleteProject,
    toggle,
    clearFilters,
    clear,
  };
});
