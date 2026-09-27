<script setup lang="ts">
import type { Task } from "~/shared/domain";
defineProps<{ task: Task; project?: string; pending: boolean }>();
defineEmits<{ edit: [task: Task]; toggle: [task: Task] }>();
const dateLabel = (date: string) =>
  date
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(date))
    : "";
</script>
<template>
  <article class="task-card" :class="{ completed: task.status === 'done' }">
    <div class="task-top">
      <span class="project-caption">{{ project }}</span
      ><button
        class="icon-button"
        :disabled="pending"
        :aria-label="`Edit ${task.title}`"
        @click="$emit('edit', task)"
      >
        •••
      </button>
    </div>
    <div class="task-title">
      <button
        class="check"
        :class="{ checked: task.status === 'done' }"
        :disabled="pending"
        :aria-label="`${task.status === 'done' ? 'Reopen' : 'Complete'} ${task.title}`"
        :aria-pressed="task.status === 'done'"
        @click="$emit('toggle', task)"
      >
        {{ task.status === "done" ? "✓" : "" }}</button
      ><button
        class="title-button"
        :disabled="pending"
        @click="$emit('edit', task)"
      >
        {{ task.title }}
      </button>
    </div>
    <p v-if="task.description" class="task-description">
      {{ task.description }}
    </p>
    <div class="task-footer">
      <div class="tags">
        <span v-for="tag in task.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <time v-if="task.dueDate" :datetime="task.dueDate"
        >◷ {{ dateLabel(task.dueDate) }}</time
      >
    </div>
  </article>
</template>
