import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "@/app/about/page";
import ArticlesPage from "@/app/articles/page";
import ChatPage from "@/app/chat/page";
import ContactPage from "@/app/contact/page";
import LabPage from "@/app/lab/page";
import NotesPage from "@/app/notes/page";
import HomePage from "@/app/page";
import ProjectDetailPage from "@/app/projects/[slug]/page";
import ProjectsPage from "@/app/projects/page";
import TagPage from "@/app/tags/[tag]/page";
import TimelinePage from "@/app/timeline/page";

describe("public routes", () => {
  it("renders the home page hero with english navigation and a bio panel", async () => {
    render(await HomePage());
    expect(screen.getByRole("link", { name: /view projects/i })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText(/computer engineer based in madrid/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^signal$/i)).not.toBeInTheDocument();
  });

  it("renders the about and contact pages in english", async () => {
    render(await AboutPage());
    expect(screen.getByRole("heading", { name: /about/i })).toBeInTheDocument();
    expect(screen.getAllByText(/ai engineer and computer engineer based in madrid/i).length).toBeGreaterThan(0);

    render(await ContactPage());
    expect(screen.getByText(/quick brief/i)).toBeInTheDocument();
    expect(screen.getByText(/instagram/i)).toBeInTheDocument();
  });

  it("renders the timeline page with ranged experience and recent projects", () => {
    render(<TimelinePage />);
    expect(screen.getByRole("heading", { name: /^timeline$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /lead ai instructor/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /ml engineer \/ data scientist/i })).toBeInTheDocument();
    expect(screen.getAllByText(/factoría f5/i).length).toBeGreaterThan(0);
  });

  it("renders projects, articles and notes indexes in english", async () => {
    render(await ProjectsPage());
    expect(screen.getByRole("heading", { name: /projects/i })).toBeInTheDocument();
    render(await ArticlesPage());
    expect(screen.getByRole("heading", { name: /articles/i })).toBeInTheDocument();
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

  it("renders the lab and chat pages in english", async () => {
    render(await LabPage());
    expect(screen.getByRole("heading", { name: /ai lab/i })).toBeInTheDocument();
    render(await ChatPage());
    expect(screen.getByRole("heading", { name: /personal chat/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });
});
