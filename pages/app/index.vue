<script setup lang="ts">
import {
  projectSchema,
  taskSchema,
  type Task,
  type Project,
  type Status,
} from "~/shared/domain";
definePageMeta({ middleware: "auth" });
const auth = useAuthStore(),
  store = useWorkspaceStore();
const columns: { value: Status; label: string; symbol: string }[] = [
  { value: "todo", label: "To do", symbol: "○" },
  { value: "doing", label: "In progress", symbol: "◐" },
  { value: "done", label: "Done", symbol: "●" },
];
const modal = ref<HTMLDialogElement>(),
  mode = ref<"task" | "project">("task"),
  editing = ref(""),
  formError = ref(""),
  saving = ref(false),
  deleteConfirm = ref(false);
const taskForm = reactive({
  title: "",
  description: "",
  projectId: "",
  status: "todo" as Status,
  dueDate: "",
  tags: "",
});
const projectForm = reactive({ name: "", color: "violet" as Project["color"] });
const selectedProject = computed(() =>
  store.projects.find((p) => p.id === store.projectId),
);
const completed = computed(
  () => store.tasks.filter((t) => t.status === "done").length,
);
onMounted(() => {
  store.restorePrefs();
  store.load();
});
function openTask(task?: Task, status: Status = "todo") {
  mode.value = "task";
  editing.value = task?.id || "";
  Object.assign(
    taskForm,
    task
      ? { ...task, tags: task.tags.join(", ") }
      : {
          title: "",
          description: "",
          projectId: store.projectId || store.projects[0]?.id || "",
          status,
          dueDate: "",
          tags: "",
        },
  );
  showModal();
}
function openProject(project?: Project) {
  mode.value = "project";
  editing.value = project?.id || "";
  Object.assign(projectForm, project || { name: "", color: "violet" });
  showModal();
}
async function showModal() {
  formError.value = "";
  deleteConfirm.value = false;
  await nextTick();
  modal.value?.showModal();
}
async function save() {
  formError.value = "";
  saving.value = true;
  try {
    if (mode.value === "task") {
      const body = taskSchema.safeParse({
        ...taskForm,
        tags: [
          ...new Set(
            taskForm.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          ),
        ],
      });
      if (!body.success) {
        formError.value = body.error.issues[0]!.message;
        return;
      }
      await store.saveTask(body.data, editing.value || undefined);
    } else {
      const body = projectSchema.safeParse(projectForm);
      if (!body.success) {
        formError.value = body.error.issues[0]!.message;
        return;
      }
      await store.saveProject(body.data, editing.value || undefined);
    }
    modal.value?.close();
  } catch {
    formError.value = "Could not save your changes. Please try again.";
  } finally {
    saving.value = false;
  }
}
async function remove() {
  if (!deleteConfirm.value) {
    deleteConfirm.value = true;
    return;
  }
  saving.value = true;
  try {
    if (mode.value === "task") await store.deleteTask(editing.value);
    else await store.deleteProject(editing.value);
    modal.value?.close();
  } catch {
    formError.value = "Could not delete. Please try again.";
  } finally {
    saving.value = false;
  }
}
async function logout() {
  try {
    await auth.logout();
  } catch {
    store.error = "Could not sign out. Please try again.";
  }
}
</script>
<template>
  <div class="workspace-shell">
    <header class="workspace-nav">
      <NuxtLink class="brand" to="/"
        ><span class="brand-mark" aria-hidden="true">✳</span>taskly</NuxtLink
      >
      <div class="workspace-label"><span class="workspace-avatar">B</span><div>Bloomline<small>A space for good ideas</small></div></div>
      <nav class="project-nav" aria-label="Projects">
      <button
        class="sidebar-link"
        :class="{ active: !store.projectId }"
        @click="store.projectId = ''"
      >
        <span>▦</span> All tasks <small>{{ store.tasks.length }}</small>
      </button>
      <div
        v-for="project in store.projects"
        :key="project.id"
        class="project-row"
      >
        <button
          class="sidebar-link"
          :class="{ active: store.projectId === project.id }"
          @click="store.projectId = project.id"
        >
          <i class="color-dot" :class="project.color" />{{
            project.name
          }}</button
        ><button
          class="project-edit"
          :aria-label="`Edit project ${project.name}`"
          @click="openProject(project)"
        >
          ···
        </button>
      </div>
      <button class="add-project" aria-label="Create project" @click="openProject()">+ New project</button>
      </nav>
      <div class="sidebar-bottom">
        <div class="user-row">
          <span class="avatar">{{ auth.user?.name.charAt(0) }}</span>
          <div>
            <strong>{{ auth.user?.name }}</strong
            ><small>Bloomline member</small>
          </div>
          <button class="icon-button" aria-label="Sign out" @click="logout">
            ↪
          </button>
        </div>
      </div>
    </header>
    <main class="workspace-main">
      <header class="topbar">
        <span
          >Bloomline <span class="breadcrumb">/</span>
          <strong>{{ selectedProject?.name || "All tasks" }}</strong></span
        ><span class="workspace-motto">Make room for a little momentum ✳</span>
      </header>
      <div class="workspace-content">
        <div class="page-heading">
          <div>
            <div class="eyebrow">YOUR DAY, IN BLOOM</div>
            <h1>
              {{ selectedProject?.name || "All tasks"
              }}
            </h1>
            <p>Big ideas, small steps. Find your next good thing.</p>
          </div>
          <button
            class="button primary"
            :disabled="!store.projects.length || store.loading"
            @click="openTask()"
          >
            + New task
          </button>
        </div>
        <div class="stats">
          <div>
            <span class="stat-icon coral">▦</span>
            <div>
              <strong>{{ store.tasks.length }}</strong
              ><span>Total tasks</span>
            </div>
          </div>
          <div>
            <span class="stat-icon orange">◐</span>
            <div>
              <strong>{{
                store.tasks.filter((t) => t.status === "doing").length
              }}</strong
              ><span>In progress</span>
            </div>
          </div>
          <div>
            <span class="stat-icon mint">✓</span>
            <div>
              <strong>{{ completed }}</strong
              ><span>Completed</span>
            </div>
          </div>
          <div class="progress-stat">
            <div>
              <strong
                >{{
                  store.tasks.length
                    ? Math.round((completed / store.tasks.length) * 100)
                    : 0
                }}%</strong
              ><span>All-workspace progress</span>
            </div>
            <div class="progress-track">
              <i
                :style="{
                  width: `${store.tasks.length ? (completed / store.tasks.length) * 100 : 0}%`,
                }"
              />
            </div>
          </div>
        </div>
        <div class="toolbar">
          <label class="search"
            ><span>⌕</span
            ><input
              v-model="store.query"
              aria-label="Search tasks"
              placeholder="Search tasks…" /></label
          ><select v-model="store.status" aria-label="Filter status">
            <option value="">All statuses</option>
            <option
              v-for="column in columns"
              :key="column.value"
              :value="column.value"
            >
              {{ column.label }}
            </option></select
          ><select v-model="store.tag" aria-label="Filter tag">
            <option value="">All tags</option>
            <option v-for="tag in store.tags" :key="tag">{{ tag }}</option>
          </select>
          <div class="view-toggle">
            <button
              :class="{ selected: store.view === 'board' }"
              :aria-pressed="store.view === 'board'"
              @click="store.setView('board')"
            >
              ▥ Board</button
            ><button
              :class="{ selected: store.view === 'list' }"
              :aria-pressed="store.view === 'list'"
              @click="store.setView('list')"
            >
              ☰ List
            </button>
          </div>
        </div>
        <div v-if="store.error" role="alert" class="error banner">
          {{ store.error }} <button @click="store.load()">Retry</button>
        </div>
        <div v-if="store.loading" class="empty-state" role="status">
          Getting your workspace ready…
        </div>
        <div v-else-if="!store.projects.length" class="empty-state">
          <h2>A fresh start.</h2>
          <p>Create your first project to start adding tasks.</p>
          <button class="button primary" @click="openProject()">
            Create project
          </button>
        </div>
        <template v-else
          ><div v-if="!store.filtered.length" class="empty-state">
            <h2>No tasks here yet.</h2>
            <p>Add a task or adjust your filters.</p>
            <button class="button secondary" @click="store.clearFilters()">
              Clear filters
            </button>
          </div>
          <div v-if="store.view === 'board'" class="board">
            <section
              v-for="column in columns"
              :key="column.value"
              class="board-column"
            >
              <header :class="column.value">
                <h2>
                  <span>{{ column.symbol }}</span
                  >{{ column.label
                  }}<small>{{
                    store.filtered.filter((t) => t.status === column.value)
                      .length
                  }}</small>
                </h2>
                <button
                  :aria-label="`Add task to ${column.label}`"
                  @click="openTask(undefined, column.value)"
                >
                  +
                </button>
              </header>
              <TaskCard
                v-for="task in store.filtered.filter(
                  (t) => t.status === column.value,
                )"
                :key="task.id"
                :task="task"
                :project="
                  store.projects.find((p) => p.id === task.projectId)?.name
                "
                :pending="store.pending.includes(task.id)"
                @edit="openTask"
                @toggle="store.toggle"
              /><button
                class="add-task"
                @click="openTask(undefined, column.value)"
              >
                + Add task
              </button>
            </section>
          </div>
          <div v-else class="task-list">
            <div v-for="task in store.filtered" :key="task.id">
              <span class="list-status">{{
                columns.find((c) => c.value === task.status)?.label
              }}</span
              ><TaskCard
                :task="task"
                :project="
                  store.projects.find((p) => p.id === task.projectId)?.name
                "
                :pending="store.pending.includes(task.id)"
                @edit="openTask"
                @toggle="store.toggle"
              />
            </div></div
        ></template>
        <div class="workspace-footer">
          One small step is still a step. ✳<span
            >{{ store.filtered.length }} tasks in view</span
          >
        </div>
      </div>
    </main>
    <dialog
      ref="modal"
      aria-labelledby="dialog-title"
      @cancel="saving && $event.preventDefault()"
    >
      <form @submit.prevent="save">
        <div class="dialog-heading">
          <h2 id="dialog-title">{{ editing ? "Edit" : "New" }} {{ mode }}</h2>
          <button
            type="button"
            class="icon-button"
            :disabled="saving"
            aria-label="Close dialog"
            @click="modal?.close()"
          >
            ✕
          </button>
        </div>
        <template v-if="mode === 'task'"
          ><label
            >Title<input
              v-model="taskForm.title"
              required
              maxlength="120"
              autofocus /></label
          ><label
            >Description<textarea
              v-model="taskForm.description"
              rows="3"
              maxlength="1000"
            />
          </label>
          <div class="form-row">
            <label
              >Project<select v-model="taskForm.projectId" required>
                <option
                  v-for="project in store.projects"
                  :key="project.id"
                  :value="project.id"
                >
                  {{ project.name }}
                </option>
              </select></label
            ><label
              >Status<select v-model="taskForm.status">
                <option
                  v-for="column in columns"
                  :key="column.value"
                  :value="column.value"
                >
                  {{ column.label }}
                </option>
              </select></label
            >
          </div>
          <label>Due date<input v-model="taskForm.dueDate" type="date" /></label
          ><label
            >Tags <small>Comma-separated, up to 5</small
            ><input
              v-model="taskForm.tags"
              placeholder="design, research" /></label></template
        ><template v-else
          ><label
            >Project name<input
              v-model="projectForm.name"
              required
              maxlength="60"
              autofocus /></label
          ><label
            >Color<select v-model="projectForm.color">
              <option value="violet">Violet</option>
              <option value="blue">Blue</option>
              <option value="amber">Amber</option>
              <option value="green">Green</option>
            </select></label
          ></template
        >
        <p v-if="formError" class="error" role="alert">{{ formError }}</p>
        <p v-if="deleteConfirm" class="error">
          {{
            mode === "project"
              ? "This deletes the project and all its tasks."
              : "This permanently deletes this task."
          }}
          Click Confirm delete to continue.
        </p>
        <div class="dialog-actions">
          <button
            v-if="editing"
            type="button"
            class="danger-button"
            :disabled="saving || store.pending.length > 0"
            @click="remove"
          >
            {{ deleteConfirm ? "Confirm delete" : "Delete" }}</button
          ><button
            type="button"
            class="button secondary"
            :disabled="saving"
            @click="modal?.close()"
          >
            Cancel</button
          ><button class="button primary" :disabled="saving">
            {{ saving ? "Saving…" : "Save changes" }}
          </button>
        </div>
      </form>
    </dialog>
  </div>
</template>
