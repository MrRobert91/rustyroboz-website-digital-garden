import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AboutPage from "@/app/about/page";
import ArticlesPage from "@/app/articles/page";
import ChatPage from "@/app/chat/page";
import ContactPage from "@/app/contact/page";
import LabPage from "@/app/lab/page";
import NotesPage from "@/app/notes/page";
import HomePage from "@/app/page";
import ArticleDetailPage from "@/app/articles/[slug]/page";
import ProjectDetailPage from "@/app/projects/[slug]/page";
import ProjectsPage from "@/app/projects/page";
import TagPage from "@/app/tags/[tag]/page";
import TimelinePage from "@/app/timeline/page";

describe("public routes", () => {
  it("renders the home page hero with english navigation and a bio panel", async () => {
    render(await HomePage());
    expect(screen.getByRole("link", { name: /view projects/i })).toHaveAttribute("href", "/projects");
    expect(screen.getByText(/latest work/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /see all projects/i })).toHaveAttribute("href", "/projects");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText(/currently interested in/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/^signal$/i)).not.toBeInTheDocument();
  });

  it("shows the four most recent projects and articles on the home page", async () => {
    render(await HomePage());

    const latestWork = screen.getByText(/latest work/i).closest("section");
    const latestArticles = screen.getByText(/^writing$/i, { selector: "p" }).closest("section");
    expect(latestWork).not.toBeNull();
    expect(latestArticles).not.toBeNull();

    expect(within(latestWork as HTMLElement).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "The Last Observation",
      "Qiskit Certification Prep: an interactive quantum study lab",
      "AI Learning Factory: from a vague idea to a publishable course",
      "SharedBrain",
    ]);
    expect(within(latestWork as HTMLElement).queryByText(/susbeer vr experience/i)).not.toBeInTheDocument();
    expect(within(latestArticles as HTMLElement).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent?.replace("↗", "").trim())).toEqual([
      "Cuando los humanos trabajan para los agentes: cómo nació El autor material",
      "Hermes Agent en un VPS de Hetzner con OpenRouter",
      "12 Testers, 14 Days, and a Subreddit: How I Published My First App on Google Play",
      "From Dusty MVP to Google Play: Bringing Cartastrofe Back",
    ]);
  });

  it("keeps canonical catalog codes in selected work and the full projects page", async () => {
    const home = render(await HomePage());
    const homeFactory = screen.getByRole("heading", { name: /ai learning factory/i }).closest("article");
    const homeQiskit = screen.getByRole("heading", { name: /qiskit certification prep/i }).closest("article");
    expect(within(homeFactory as HTMLElement).getByText("PROJ-15")).toBeInTheDocument();
    expect(within(homeQiskit as HTMLElement).getByText("EXP-15")).toBeInTheDocument();
    home.unmount();

    render(await ProjectsPage());
    const projectsFactory = screen.getByRole("heading", { name: /ai learning factory/i }).closest("article");
    const projectsQiskit = screen.getByRole("heading", { name: /qiskit certification prep/i }).closest("article");
    expect(within(projectsFactory as HTMLElement).getByText("PROJ-15")).toBeInTheDocument();
    expect(within(projectsQiskit as HTMLElement).getByText("EXP-15")).toBeInTheDocument();
  });

  it("renders the about and contact pages in english", async () => {
    const about = render(await AboutPage());
    expect(screen.getByRole("heading", { level: 1, name: /about/i })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText(/ai engineer and computer engineer based in madrid/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Lead AI Instructor/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ship the rusty thing/i)).not.toBeInTheDocument();
    expect(screen.getByText("AI adoption consulting")).toBeInTheDocument();
    expect(screen.getByText("Custom AI workflow automation")).toBeInTheDocument();
    about.unmount();

    render(await ContactPage());
    expect(screen.getByRole("heading", { level: 1, name: /let's build/i })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.queryByText(/quick brief/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /davidrobertnunez@gmail.com/i })).toHaveAttribute(
      "href",
      "mailto:davidrobertnunez@gmail.com",
    );
    const mediumRow = screen.getByText("Medium").closest("li");
    expect(within(mediumRow as HTMLElement).getByText("@rustyroboz")).toBeInTheDocument();
    expect(screen.queryByText("@@rustyroboz")).not.toBeInTheDocument();
    expect(screen.getByText(/instagram/i)).toBeInTheDocument();
  });

  it("renders the timeline page with ranged experience and recent projects", () => {
    const view = render(<TimelinePage />);
    expect(screen.getByRole("heading", { name: /^timeline$/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /lead ai instructor/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /ml engineer \/ data scientist/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /factoría f5/i })).toHaveAttribute("href", "https://factoriaf5.org/");
    expect(screen.getByRole("link", { name: /^the last observation$/i })).toHaveAttribute(
      "href",
      "/projects/the-last-observation",
    );
    expect(screen.queryByRole("link", { name: /case study/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /sample project/i })).not.toBeInTheDocument();
    expect(view.container.querySelector(".reading-surface")).toHaveClass("max-w-6xl");
    expect(screen.getAllByText(/factoría f5/i).length).toBeGreaterThan(0);
  });

  it("renders projects, articles and notes indexes in english", async () => {
    const projects = render(await ProjectsPage());
    expect(screen.getByRole("heading", { level: 1, name: /projects/i })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    projects.unmount();
    const articles = render(await ArticlesPage());
    expect(screen.getByRole("heading", { level: 1, name: /articles/i })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(articles.container.querySelector(".dotted-paper .reading-surface")).toHaveClass("max-w-6xl");
    articles.unmount();
    const notes = render(await NotesPage());
    expect(screen.getByRole("heading", { level: 1, name: /digital garden/i })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(notes.container.querySelector(".dotted-paper")).not.toBeInTheDocument();
  });

  it("renders a project detail route from slug", async () => {
    render(await ProjectDetailPage({ params: Promise.resolve({ slug: "technical-interview-chatbot" }) }));
    expect(screen.getByRole("heading", { name: /technical interview chatbot/i })).toBeInTheDocument();
  });

  it("marks Spanish article details and cards with their content language", async () => {
    const slug = "cuando-los-humanos-trabajan-para-los-agentes-como-nacio-el-autor-material";
    const detail = render(await ArticleDetailPage({ params: Promise.resolve({ slug }) }));
    expect(detail.container.querySelector("article[lang='es']")).toBeInTheDocument();
    detail.unmount();

    const list = render(await ArticlesPage());
    expect(list.getByText(/Cuando los humanos trabajan/i).closest("article")).toHaveAttribute("lang", "es");
  });

  it("renders the Learning AI Factory case study with a playable generated sample", async () => {
    render(await ProjectDetailPage({ params: Promise.resolve({ slug: "learning-ai-factory" }) }));
    expect(screen.getByRole("heading", { name: /ai learning factory/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/generated sample/i)).toHaveAttribute("src", "/videos/nlp-course-sample.mp4");
  });

  it("renders the Qiskit certification prep prototype", async () => {
    render(await ProjectDetailPage({ params: Promise.resolve({ slug: "qiskit-certification-prep" }) }));
    expect(screen.getByRole("heading", { name: /qiskit certification prep/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/MrRobert91/QuantumComputingGuide",
    );
    expect(screen.getByRole("link", { name: "Live app" })).toHaveAttribute(
      "href",
      "https://quantumcomputingguide-k4il6s.sliplane.app/",
    );
    expect(screen.getByTestId("mdx-content")).toHaveTextContent(
      "A Bell circuit executed on Qiskit Aer",
    );
  });

  it("renders The Last Observation case study with local and YouTube video", async () => {
    render(await ProjectDetailPage({ params: Promise.resolve({ slug: "the-last-observation" }) }));
    expect(screen.getByRole("heading", { name: /^the last observation$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /play video: the last observation — game trailer 2/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Play on itch.io" })).toHaveAttribute(
      "href",
      "https://rustyroboz.itch.io/the-last-observation",
    );
    const articleBody = screen.getByTestId("mdx-content");
    expect(articleBody).toHaveTextContent("GitHub repository");
    expect(articleBody).toHaveTextContent("https://github.com/MrRobert91/AI-Browser-Game-Jam-4");
    expect(articleBody).toHaveTextContent("Twenty seconds inside the observable world");
    expect(articleBody).toHaveTextContent("/videos/the-last-observation/observable-world-gameplay.webm");
    expect(articleBody).toHaveTextContent("Wave Function Collapse, but scheduled by attention");
    expect(articleBody).toHaveTextContent("revisits and gaze duration into an attention portrait.");
    expect(articleBody).not.toHaveTextContent("a local haiku and a reproducible seed");
    expect(screen.queryByRole("img", { name: /a completed run records the world/i })).not.toBeInTheDocument();
  });

  it("renders TopoKarts with both playable release links", async () => {
    render(await ProjectDetailPage({ params: Promise.resolve({ slug: "topokarts" }) }));
    expect(screen.getByRole("heading", { name: /^topokarts$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Play on itch.io" })).toHaveAttribute(
      "href",
      "https://rustyroboz.itch.io/topokarts",
    );
    expect(screen.getByRole("link", { name: "Live game" })).toHaveAttribute(
      "href",
      "https://topokarts.sliplane.app/",
    );
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
