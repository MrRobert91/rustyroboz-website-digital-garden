import { describe, expect, it } from "vitest";
import { getCollection } from "@/lib/content";
import { timeline } from "@/lib/timeline";

describe("project timeline integrity", () => {
  it("represents every published project card exactly once with its catalog type", async () => {
    const projects = await getCollection("projects");

    for (const project of projects) {
      const href = `/projects/${project.slug}`;
      const matches = timeline.filter((entry) => entry.links?.some((link) => link.href === href));
      const expectedKind = "type" in project && project.type === "project" ? "project" : "experiment";

      expect(matches, `${project.slug} must have exactly one timeline entry`).toHaveLength(1);
      expect(matches[0].kind, `${project.slug} must keep its project/experiment type`).toBe(expectedKind);
    }
  });
});
