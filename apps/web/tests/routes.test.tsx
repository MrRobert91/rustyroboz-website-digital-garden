import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";
import AboutPage from "@/app/about/page";
import ProjectsPage from "@/app/projects/page";
import ArticlesPage from "@/app/articles/page";
import NotesPage from "@/app/notes/page";
import LabPage from "@/app/lab/page";
import ChatPage from "@/app/chat/page";
import TagPage from "@/app/tags/[tag]/page";
import ProjectDetailPage from "@/app/projects/[slug]/page";

describe("public routes", () => {
  it("renders the home page hero and navigation", async () => {
    render(await HomePage());
    expect(screen.getByRole("link", { name: /proyectos/i })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("heading", { name: /diseño, sistemas e ia aplicada/i })).toBeInTheDocument();
  });

  it("renders the about page with timeline copy", async () => {
    render(await AboutPage());
    expect(screen.getByRole("heading", { name: /sobre mí/i })).toBeInTheDocument();
    expect(screen.getByText(/producto, ingeniería e investigación aplicada/i)).toBeInTheDocument();
  });

  it("renders projects, articles and notes indexes", async () => {
    render(await ProjectsPage());
    expect(screen.getByRole("heading", { name: /proyectos/i })).toBeInTheDocument();
    render(await ArticlesPage());
    expect(screen.getByRole("heading", { name: /artículos/i })).toBeInTheDocument();
    render(await NotesPage());
    expect(screen.getByRole("heading", { name: /digital garden/i })).toBeInTheDocument();
  });

  it("renders a project detail route from slug", async () => {
    render(await ProjectDetailPage({ params: Promise.resolve({ slug: "ai-safety-evals-workbench" }) }));
    expect(screen.getByRole("heading", { name: /ai safety evals workbench/i })).toBeInTheDocument();
  });

  it("filters content by tag", async () => {
    render(await TagPage({ params: Promise.resolve({ tag: "ai" }) }));
    expect(screen.getByRole("heading", { name: /tag: ai/i })).toBeInTheDocument();
    expect(screen.getByText(/spec-driven delivery for ai products/i)).toBeInTheDocument();
  });

  it("renders the coming soon lab and chat pages", async () => {
    render(await LabPage());
    expect(screen.getByRole("heading", { name: /ai lab/i })).toBeInTheDocument();
    render(await ChatPage());
    expect(screen.getByRole("heading", { name: /chat personal/i })).toBeInTheDocument();
  });
});

