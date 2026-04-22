import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";
import AboutPage from "@/app/about/page";
import ContactPage from "@/app/contact/page";
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
    expect(screen.getByRole("heading", { name: /ai, vr, games, software and strange prototypes/i })).toBeInTheDocument();
  });

  it("renders the about and contact pages with migrated profile copy", async () => {
    render(await AboutPage());
    expect(screen.getByRole("heading", { name: /sobre mí/i })).toBeInTheDocument();
    expect(screen.getAllByText(/computer engineer based in madrid/i).length).toBeGreaterThan(0);

    render(await ContactPage());
    expect(screen.getByRole("heading", { name: /contacto/i })).toBeInTheDocument();
    expect(screen.getByText(/instagram/i)).toBeInTheDocument();
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
    render(await ProjectDetailPage({ params: Promise.resolve({ slug: "technical-interview-chatbot" }) }));
    expect(screen.getByRole("heading", { name: /technical interview chatbot/i })).toBeInTheDocument();
  });

  it("filters content by tag", async () => {
    render(await TagPage({ params: Promise.resolve({ tag: "ai-art" }) }));
    expect(screen.getByRole("heading", { name: /tag: ai-art/i })).toBeInTheDocument();
    expect(screen.getAllByText(/metroidvania game using ai generated art/i).length).toBeGreaterThan(0);
  });

  it("renders the lab and chat pages", async () => {
    render(await LabPage());
    expect(screen.getByRole("heading", { name: /ai lab/i })).toBeInTheDocument();
    render(await ChatPage());
    expect(screen.getByRole("heading", { name: /chat personal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
  });
});
