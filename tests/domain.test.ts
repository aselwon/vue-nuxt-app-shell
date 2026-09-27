import { describe, it, expect } from "vitest";
import {
  taskSchema,
  projectSchema,
  filterTasks,
  type Task,
} from "../shared/domain";
const task: Task = {
  id: "a",
  title: "Build interface",
  description: "Accessible forms",
  projectId: "p",
  status: "doing",
  dueDate: "2026-10-01",
  tags: ["design"],
};
describe("input validation", () => {
  it("trims names and rejects blank titles", () => {
    expect(projectSchema.parse({ name: " Name " }).name).toBe("Name");
    expect(taskSchema.safeParse({ ...task, title: "  " }).success).toBe(false);
  });
  it("rejects impossible dates and excessive tags", () => {
    expect(
      taskSchema.safeParse({ ...task, dueDate: "2026-02-30" }).success,
    ).toBe(false);
    expect(
      taskSchema.safeParse({ ...task, tags: Array(6).fill("a") }).success,
    ).toBe(false);
  });
  it("rejects invalid status and missing project", () => {
    expect(taskSchema.safeParse({ ...task, status: "invalid" }).success).toBe(
      false,
    );
    expect(taskSchema.safeParse({ ...task, projectId: "" }).success).toBe(
      false,
    );
  });
});
describe("task filtering", () => {
  it("combines case-insensitive search, project, tag and status", () => {
    expect(
      filterTasks([task], {
        query: "ACCESSIBLE",
        projectId: "p",
        status: "doing",
        tag: "design",
      }),
    ).toEqual([task]);
    expect(
      filterTasks([task], {
        query: "",
        projectId: "other",
        status: "",
        tag: "",
      }),
    ).toEqual([]);
  });
});
