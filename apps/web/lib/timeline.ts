export type TimelineKind =
  | "experience"
  | "mentoring"
  | "education"
  | "certification"
  | "course"
  | "award"
  | "project"
  | "experiment";

export type TimelineLink = {
  label: string;
  href: string;
};

/** A visual attached to an entry: an image, local video, or embedded YouTube video. */
export type TimelineMediaItem =
  | { type: "youtube"; id: string; title?: string }
  | { type: "video"; src: string; poster?: string; title?: string }
  | { type: "image"; src: string; alt?: string };

export type TimelineEntry = {
  id: string;
  kind: TimelineKind;
  title: string;
  org?: string;
  /** Start date as "YYYY-MM". */
  start: string;
  /** End date as "YYYY-MM", or "present" for ongoing. Omit for single, point-in-time events. */
  end?: string;
  description: string;
  /** Videos and images shown in a carousel on the card. */
  media?: TimelineMediaItem[];
  links?: TimelineLink[];
};

const KIND_LABELS: Record<TimelineKind, string> = {
  experience: "Experience",
  mentoring: "Mentoring",
  education: "Education",
  certification: "Certification",
  course: "Course",
  award: "Award",
  project: "Project",
  experiment: "Experiment",
};

export function kindLabel(kind: TimelineKind) {
  return KIND_LABELS[kind];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseYearMonth(value: string) {
  const [year, month] = value.split("-").map((part) => Number.parseInt(part, 10));
  return { year, month: Number.isFinite(month) ? month : 1 };
}

function formatYearMonth(value: string) {
  const { year, month } = parseYearMonth(value);
  return `${MONTHS[month - 1]} ${year}`;
}

/** Number of months a ranged entry spans (0 for point events). */
export function spanMonths(entry: TimelineEntry) {
  if (!entry.end) {
    return 0;
  }
  const start = parseYearMonth(entry.start);
  const end =
    entry.end === "present"
      ? (() => {
          const now = new Date();
          return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
        })()
      : parseYearMonth(entry.end);
  return Math.max(0, (end.year - start.year) * 12 + (end.month - start.month));
}

/** Human label for the date or date range. */
export function formatRange(entry: TimelineEntry) {
  if (!entry.end) {
    return formatYearMonth(entry.start);
  }
  const end = entry.end === "present" ? "Present" : formatYearMonth(entry.end);
  return `${formatYearMonth(entry.start)} – ${end}`;
}

/** Compact duration label such as "4 yrs 2 mos" for ranged entries. */
export function formatDuration(entry: TimelineEntry) {
  const months = spanMonths(entry);
  if (months <= 0) {
    return null;
  }
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years} yr${years === 1 ? "" : "s"}`);
  }
  if (remaining > 0) {
    parts.push(`${remaining} mo${remaining === 1 ? "" : "s"}`);
  }
  return parts.join(" ");
}

export function isOngoing(entry: TimelineEntry) {
  return entry.end === "present";
}

/** Absolute month index (year * 12 + month), for date comparisons. */
function monthIndex(value: string) {
  const { year, month } = parseYearMonth(value);
  return year * 12 + (month - 1);
}

function startIndex(entry: TimelineEntry) {
  return monthIndex(entry.start);
}

function endIndex(entry: TimelineEntry) {
  if (!entry.end) {
    return monthIndex(entry.start);
  }
  if (entry.end === "present") {
    const now = new Date();
    return now.getUTCFullYear() * 12 + now.getUTCMonth();
  }
  return monthIndex(entry.end);
}

export type TimelineEra = {
  /** The ranged work-experience entry that defines this era, if any. */
  experience?: TimelineEntry;
  /** Projects, courses, certifications, etc. that fall within this era's dates. */
  events: TimelineEntry[];
};

/**
 * Group the timeline into eras anchored to ranged work-experience entries.
 * Each non-experience event is attached to the experience whose date range
 * contains its start date; events outside any range form experience-less
 * "gap" eras. Eras (and the events inside them) are returned newest-first.
 */
export function groupTimelineByEra(entries: TimelineEntry[]): TimelineEra[] {
  const experiences = entries
    .filter((entry) => entry.kind === "experience" && entry.end)
    .map((entry) => ({ entry, start: startIndex(entry), end: endIndex(entry) }))
    .sort((a, b) => b.end - a.end);

  const eraByExp = new Map<string, TimelineEra>(
    experiences.map((exp) => [exp.entry.id, { experience: exp.entry, events: [] as TimelineEntry[] }]),
  );

  const gapEvents: TimelineEntry[] = [];
  for (const entry of entries) {
    if (entry.kind === "experience" && entry.end) {
      continue;
    }
    const at = startIndex(entry);
    const owner = experiences.find((exp) => at >= exp.start && at <= exp.end);
    if (owner) {
      eraByExp.get(owner.entry.id)!.events.push(entry);
    } else {
      gapEvents.push(entry);
    }
  }

  type Row = { top: number; era: TimelineEra };
  const rows: Row[] = [];

  for (const exp of experiences) {
    const era = eraByExp.get(exp.entry.id)!;
    era.events.sort((a, b) => startIndex(b) - startIndex(a));
    rows.push({ top: exp.end, era });
  }

  // Cluster gap events that sit in the same slot between two experiences.
  const clusters = new Map<number, TimelineEntry[]>();
  for (const entry of gapEvents) {
    const at = startIndex(entry);
    const key = experiences.filter((exp) => exp.start > at).length;
    const bucket = clusters.get(key) ?? [];
    bucket.push(entry);
    clusters.set(key, bucket);
  }
  for (const bucket of clusters.values()) {
    bucket.sort((a, b) => startIndex(b) - startIndex(a));
    rows.push({ top: startIndex(bucket[0]), era: { events: bucket } });
  }

  rows.sort((a, b) => b.top - a.top);
  return rows.map((row) => row.era);
}

/**
 * Career and project timeline, authored newest-first.
 * Long-running roles (Stratio, Factoría F5) keep their full date range so the
 * UI can render them with extra visual weight.
 */
export const timeline: TimelineEntry[] = [
  {
    id: "factoria-f5",
    kind: "experience",
    title: "Lead AI Instructor",
    org: "Factoría F5",
    start: "2022-10",
    end: "present",
    description:
      "Designing and delivering intensive AI bootcamps — 6 editions and 5,000+ hours so far, training several hundred students in NLP, LLMs, Computer Vision and applied Deep Learning, and building RAG systems and AI agents with LangChain and CrewAI.",
    links: [{ label: "Factoría F5", href: "https://factoriaf5.org/" }],
  },
  {
    id: "the-last-observation",
    kind: "project",
    title: "The Last Observation",
    start: "2026-08",
    description:
      "A ten-minute first-person browser game where attention drives an observable Wave Function Collapse system, built end to end through an issue- and PR-based agentic workflow.",
    media: [
      {
        type: "image",
        src: "/images/projects/the-last-observation/cover.webp",
        alt: "The Last Observation retro game cover",
      },
      {
        type: "youtube",
        id: "gC1lo8776QU",
        title: "The Last Observation — Game Trailer 2",
      },
    ],
    links: [
      { label: "Play", href: "https://rustyroboz.itch.io/the-last-observation" },
      { label: "Jam submission", href: "https://itch.io/jam/ai-jam-4/rate/4891217" },
      { label: "Live build", href: "https://la-ultima-observacion-web.sliplane.app/" },
      { label: "GitHub", href: "https://github.com/MrRobert91/AI-Browser-Game-Jam-4" },
      { label: "Case study", href: "/projects/the-last-observation" },
    ],
  },
  {
    id: "qiskit-certification-prep",
    kind: "experiment",
    title: "Qiskit Certification Prep",
    start: "2026-08",
    description:
      "An interactive study lab for the IBM Qiskit v2.x Developer certification, combining illustrated lessons, quantum widgets, circuit practice, hands-on exercises and weighted mock exams.",
    media: [
      {
        type: "image",
        src: "/images/projects/quantum-computing-guide/01-study-dashboard.png",
        alt: "Qiskit Certification Prep dashboard",
      },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/MrRobert91/QuantumComputingGuide" },
      { label: "Case study", href: "/projects/qiskit-certification-prep" },
    ],
  },
  {
    id: "learning-ai-factory",
    kind: "project",
    title: "AI Learning Factory",
    start: "2026-08",
    description:
      "An agent-driven educational content factory that turns a rough idea into researched lessons, slides, voice, video and publication packages with versioning, cost tracking and human approval gates.",
    media: [
      {
        type: "image",
        src: "/images/projects/learning-ai-factory/01-projects-dashboard.png",
        alt: "AI Learning Factory projects dashboard",
      },
    ],
    links: [
      { label: "Live app", href: "https://frontend-gczzuw.sliplane.app/" },
      { label: "GitHub", href: "https://github.com/MrRobert91/Learning-AI-Factory" },
      { label: "Case study", href: "/projects/learning-ai-factory" },
    ],
  },
  {
    id: "sharedbrain",
    kind: "project",
    title: "SharedBrain",
    start: "2026-06",
    description:
      "A personal context layer for AI agents that turns scattered notes (Obsidian vaults, project repos) into actionable context. Read-only over your notes with AI output isolated in an `_ai/` folder, an MCP server for agent queries, CLI pipelines and a React dashboard. FastAPI + FastMCP + pydantic-ai backend.",
    media: [
      { type: "image", src: "/images/projects/sharedbrain/image-01.png", alt: "SharedBrain 1" },
      { type: "image", src: "/images/projects/sharedbrain/image-02.png", alt: "SharedBrain 2" },
      { type: "image", src: "/images/projects/sharedbrain/image-03.png", alt: "SharedBrain 3" },
      { type: "image", src: "/images/projects/sharedbrain/image-04.png", alt: "SharedBrain 4" },
      { type: "image", src: "/images/projects/sharedbrain/image-05.png", alt: "SharedBrain 5" },
      { type: "image", src: "/images/projects/sharedbrain/image-06.png", alt: "SharedBrain 6" },
      { type: "image", src: "/images/projects/sharedbrain/image-07.png", alt: "SharedBrain 7" },
    ],
    links: [
      { label: "Live app", href: "https://sharedbrain.sliplane.app/" },
      { label: "GitHub", href: "https://github.com/MrRobert91/SharedBrain" },
      { label: "Case study", href: "/projects/sharedbrain" },
    ],
  },
  {
    id: "topokarts",
    kind: "experiment",
    title: "TopoKarts",
    start: "2026-06",
    description:
      "A 3D arcade racer in the browser where geometric creatures race on topological surfaces — Möbius strips, tori and hyperbolic planes. 100% procedural geometry, textures and audio with Three.js. Trailer made with Fable 5.",
    media: [{ type: "youtube", id: "1PtB9z2Beow", title: "TopoKarts trailer" }],
    links: [
      { label: "GitHub", href: "https://github.com/MrRobert91/TopoKarts" },
      { label: "Case study", href: "/projects/topokarts" },
    ],
  },
  {
    id: "mira-link",
    kind: "project",
    title: "Mira Link",
    start: "2026-05",
    description:
      "An accessibility web app that lets people with severe mobility impairments fill in Google Forms and Microsoft Forms using only eye-gaze control — webcam eye tracking with MediaPipe, guided calibration, dwell-based Yes/No selection and text-to-speech. React + Vite frontend, FastAPI + SQLite + Piper backend.",
    media: [{ type: "image", src: "/images/projects/mira-link/image-01.png", alt: "Mira Link" }],
    links: [
      { label: "Website", href: "https://miralink.app/" },
      { label: "Case study", href: "/projects/mira-link" },
    ],
  },
  {
    id: "socratic-gemma",
    kind: "project",
    title: "Socratic Gemma — Gemma 4 Good Hackathon",
    start: "2026-05",
    description:
      "Hackathon submission: a Socratic tutoring assistant built on Google's Gemma models, entered in the Kaggle “Gemma 4 Good” hackathon.",
    media: [{ type: "youtube", id: "X25VUBpFyp8", title: "Socratic Gemma" }],
    links: [
      {
        label: "Writeup",
        href: "https://www.kaggle.com/competitions/gemma-4-good-hackathon/writeups/new-writeup-1779100810809",
      },
      { label: "Case study", href: "/projects/socratic-gemma" },
    ],
  },
  {
    id: "apolo-vs-zeus",
    kind: "experiment",
    title: "Apolo vs Zeus",
    start: "2026-05",
    description:
      "A browser arcade game: play as Apollo dodging Zeus's lightning bolts, scoring a point for every dodge. Keyboard or touch controls.",
    media: [{ type: "image", src: "/images/projects/apolo-vs-zeus/image-01.png", alt: "Apolo vs Zeus" }],
    links: [
      { label: "Play", href: "https://juego-zeus-y-apolo.sliplane.app/" },
      { label: "Case study", href: "/projects/apolo-vs-zeus" },
    ],
  },
  {
    id: "accessdoc",
    kind: "project",
    title: "AccessDoc",
    start: "2026-04",
    description:
      "A web app that converts any PDF into an accessible document compliant with PDF/UA-1 and WCAG 2.1 AA — automatic structure tagging, alt-text generation, logical reading order and validation with veraPDF.",
    media: [{ type: "image", src: "/images/projects/accessdoc/image-01.png", alt: "AccessDoc" }],
    links: [
      { label: "Live app", href: "https://accessdoc-mx5p1m.sliplane.app/" },
      { label: "GitHub", href: "https://github.com/MrRobert91/AccessDoc" },
      { label: "Case study", href: "/projects/accessdoc" },
    ],
  },
  {
    id: "thor-runner",
    kind: "experiment",
    title: "Thor Runner",
    start: "2026-04",
    description:
      "An endless-runner / action platformer where you play Thor, battling enemies and obstacles from Norse mythology. Playable in the browser.",
    media: [{ type: "youtube", id: "FoWHzUhiJ2Y", title: "Thor Runner" }],
    links: [
      { label: "Play", href: "https://rustyroboz.itch.io/thor-runner" },
      { label: "Case study", href: "/projects/thor-runner" },
    ],
  },
  {
    id: "cuentee",
    kind: "project",
    title: "Cuentee",
    start: "2025-07",
    end: "2026-05",
    description:
      "Custom illustrated children's stories, generated on demand and ready to download. React / StoryBook UI.",
    media: [{ type: "image", src: "/images/projects/cuentee/image-01.png", alt: "Cuentee" }],
    links: [
      { label: "Website", href: "https://www.cuentee.com/" },
      { label: "GitHub", href: "https://github.com/MrRobert91/StoryBookUI" },
      {
        label: "Article",
        href: "https://medium.com/@rustyroboz/cuentee-cuentos-infantiles-a-medida-ilustrados-y-listos-para-descargar-318399fb6e03",
      },
      { label: "Case study", href: "/projects/cuentee" },
    ],
  },
  {
    id: "cartastrofe",
    kind: "project",
    title: "Cartastrofe",
    start: "2025-02",
    end: "2026-02",
    description:
      "A card game for couples built in Flutter, revived from a dusty MVP and taken through the full Google Play release pipeline — signed App Bundle, store listing, privacy policy and a closed-beta waitlist with MailerLite.",
    media: [
      { type: "image", src: "/images/projects/cartastrofe/image-01.png", alt: "Cartastrofe promotional artwork" },
      { type: "image", src: "/images/projects/cartastrofe/image-02.webp", alt: "Cartastrofe listing on Google Play" },
      { type: "image", src: "/images/projects/cartastrofe/image-03.webp", alt: "Cartastrofe main menu on Android" },
      { type: "image", src: "/images/projects/cartastrofe/image-04.webp", alt: "Cartastrofe card-selection screen" },
      { type: "image", src: "/images/projects/cartastrofe/image-05.webp", alt: "Cartastrofe in-game tutorial" },
    ],
    links: [
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.susbeerginman.cartastrofe&hl=es" },
      { label: "Website", href: "https://www.cartastrofe.com/" },
      { label: "itch.io", href: "https://rustyroboz.itch.io/cartastrofe" },
      { label: "GitHub", href: "https://github.com/MrRobert91/juego_cartas" },
      {
        label: "Medium — revival",
        href: "https://medium.com/@rustyroboz/de-mvp-cogiendo-polvo-a-google-play-la-resurrecci%C3%B3n-de-cartastrofe-21f1f6760aec",
      },
      {
        label: "Medium — launch",
        href: "https://medium.com/@rustyroboz/12-testers-14-d%C3%ADas-y-un-subreddit-as%C3%AD-publiqu%C3%A9-mi-primera-app-en-google-play-79cece838e02",
      },
      { label: "Case study", href: "/projects/cartastrofe" },
    ],
  },
  {
    id: "technical-interview-chatbot",
    kind: "experiment",
    title: "Technical Interview Chatbot",
    start: "2024-12",
    description:
      "A proof of concept for practising technical interviews with an LLM that asks follow-up questions, gives feedback and keeps the conversation in context.",
    media: [{ type: "image", src: "/images/projects/technical-interview-chatbot/image-01.png", alt: "Technical Interview Chatbot" }],
    links: [
      { label: "Live demo", href: "https://chatbot-llm-interview.streamlit.app/" },
      { label: "GitHub", href: "https://github.com/MrRobert91/StreamlitLLMChatbot" },
      { label: "Case study", href: "/projects/technical-interview-chatbot" },
    ],
  },
  {
    id: "susbeer-vr-experience",
    kind: "experiment",
    title: "Susbeer VR Experience",
    start: "2024-11",
    description:
      "A personal Meta Quest 2 experience built in Unity with an explorable forest, a maze, AI-generated music and real locations captured as 3D scans.",
    media: [
      {
        type: "image",
        src: "/images/projects/susbeer-vr-experience/image-01.png",
        alt: "Susbeer VR Experience",
      },
    ],
    links: [{ label: "Case study", href: "/projects/susbeer-vr-experience" }],
  },
  {
    id: "azure-ai-engineer",
    kind: "certification",
    title: "Microsoft Certified: Azure AI Engineer Associate",
    org: "Microsoft (AI-102)",
    start: "2024-04",
    description:
      "Cloud certification for designing and deploying AI solutions on Azure. Valid through Apr 2027. Credential ID B14F86A8D09444D3.",
    media: [{ type: "image", src: "/images/timeline/azure-ai-engineer/image-01.png", alt: "Azure AI Engineer Associate credential" }],
    links: [
      {
        label: "Credential",
        href: "https://learn.microsoft.com/en-us/users/davidrobert-6441/credentials/b14f86a8d09444d3",
      },
    ],
  },
  {
    id: "ai-saturdays-mentor-7",
    kind: "mentoring",
    title: "Mentor — AI Saturdays, 7th edition",
    org: "Saturdays.AI Madrid",
    start: "2024-03",
    end: "2024-06",
    description: "Mentoring the Computer Vision and Reinforcement Learning tracks of the 7th-edition AI bootcamp.",
    media: [{ type: "youtube", id: "Y18CuynoBUA", title: "AI Saturdays 7th edition" }],
    links: [{ label: "Saturdays.AI", href: "https://saturdays.ai/madrid/" }],
  },
  {
    id: "who-is-moloch",
    kind: "project",
    title: "Who is Moloch — Metroidvania Jam",
    start: "2023-03",
    description:
      "A metroidvania built for Metroidvania Month Jam 19 with every asset generated by AI (Midjourney, DALL·E 2): bone-based animation, AI backgrounds and a story inspired by the game-theory concept of “Moloch”.",
    media: [
      { type: "image", src: "/images/projects/metroidvania-game-using-ai-generated-art/image-01.png", alt: "Who is Moloch 1" },
      { type: "image", src: "/images/projects/metroidvania-game-using-ai-generated-art/image-02.png", alt: "Who is Moloch 2" },
      { type: "image", src: "/images/projects/metroidvania-game-using-ai-generated-art/image-03.png", alt: "Who is Moloch 3" },
      { type: "image", src: "/images/projects/metroidvania-game-using-ai-generated-art/image-04.png", alt: "Who is Moloch 4" },
      { type: "image", src: "/images/projects/metroidvania-game-using-ai-generated-art/image-05.png", alt: "Who is Moloch 5" },
      { type: "image", src: "/images/projects/metroidvania-game-using-ai-generated-art/image-06.png", alt: "Who is Moloch 6" },
    ],
    links: [
      { label: "Play on itch.io", href: "https://rustyroboz.itch.io/who-is-moloch" },
      { label: "Article", href: "https://medium.com/@rustyroboz/metroidvania-game-using-ai-generated-art-101d4c3ef6c7" },
      { label: "Case study", href: "/projects/metroidvania-game-using-ai-generated-art" },
    ],
  },
  {
    id: "ai-saturdays-mentor-6",
    kind: "mentoring",
    title: "Mentor — AI Saturdays, 6th edition",
    org: "Saturdays.AI Madrid",
    start: "2023-03",
    end: "2023-06",
    description: "Mentoring the Computer Vision and Reinforcement Learning tracks of the 6th-edition AI bootcamp.",
    media: [
      { type: "image", src: "/images/timeline/ai-saturdays-mentor-6/image-01.jpg", alt: "AI Saturdays 6th edition 1" },
      { type: "image", src: "/images/timeline/ai-saturdays-mentor-6/image-02.jpg", alt: "AI Saturdays 6th edition 2" },
      { type: "image", src: "/images/timeline/ai-saturdays-mentor-6/image-03.jpg", alt: "AI Saturdays 6th edition 3" },
      { type: "image", src: "/images/timeline/ai-saturdays-mentor-6/image-04.jpg", alt: "AI Saturdays 6th edition 4" },
      { type: "image", src: "/images/timeline/ai-saturdays-mentor-6/image-05.jpg", alt: "AI Saturdays 6th edition 5" },
      { type: "image", src: "/images/timeline/ai-saturdays-mentor-6/image-06.jpg", alt: "AI Saturdays 6th edition 6" },
    ],
    links: [{ label: "Saturdays.AI", href: "https://saturdays.ai/madrid/" }],
  },
  {
    id: "finetuning-sd-face",
    kind: "experiment",
    title: "Fine-tuning Stable Diffusion with my face",
    start: "2022-11",
    description:
      "Fine-tuning Stable Diffusion with Dreambooth on my own face to generate personalized portraits, with a written walkthrough.",
    media: [{ type: "youtube", id: "yEptpIY9thc", title: "Stable Diffusion + Dreambooth" }],
    links: [
      {
        label: "Article",
        href: "https://medium.com/@rustyroboz/genera-im%C3%A1genes-de-tu-cara-con-stable-diffusion-y-dreambooth-b93e9c6dafe",
      },
      {
        label: "Case study",
        href: "/projects/genera-imagenes-de-tu-cara-con-stable-diffusion-y-dreambooth",
      },
    ],
  },
  {
    id: "low-cost-vr-digital-twin",
    kind: "project",
    title: "Low Cost VR Digital Twin",
    start: "2022-11",
    description:
      "A low-cost VR digital twin: 3D-scanning a real room with a phone and AI models, rebuilt as an interactive Oculus Quest 2 experience in Unity.",
    media: [
      { type: "youtube", id: "6N5dYCssoRk", title: "Low Cost VR Digital Twin" },
      { type: "image", src: "/images/projects/low-cost-vr-digital-twin/image-01.png", alt: "Low Cost VR Digital Twin 1" },
      { type: "image", src: "/images/projects/low-cost-vr-digital-twin/image-02.png", alt: "Low Cost VR Digital Twin 2" },
      { type: "image", src: "/images/projects/low-cost-vr-digital-twin/image-03.png", alt: "Low Cost VR Digital Twin 3" },
      { type: "image", src: "/images/projects/low-cost-vr-digital-twin/image-04.png", alt: "Low Cost VR Digital Twin 4" },
    ],
    links: [
      { label: "Play / Download", href: "https://rustyroboz.itch.io/low-cost-vr-digital-twin" },
      { label: "Case study", href: "/projects/low-cost-vr-digital-twin" },
    ],
  },
  {
    id: "crazy-ride",
    kind: "experiment",
    title: "Crazy Ride",
    start: "2022-11",
    description:
      "A simple Unity 3D arcade driving game for Android — dodge obstacles across levels with two-button controls. No brakes here.",
    media: [
      { type: "image", src: "/images/projects/crazy-ride/image-01.jpg", alt: "Crazy Ride 1" },
      { type: "image", src: "/images/projects/crazy-ride/image-02.jpg", alt: "Crazy Ride 2" },
      { type: "image", src: "/images/projects/crazy-ride/image-03.jpg", alt: "Crazy Ride 3" },
      { type: "image", src: "/images/projects/crazy-ride/image-04.jpg", alt: "Crazy Ride 4" },
    ],
    links: [
      { label: "Play", href: "https://rustyroboz.itch.io/crazy-ride" },
      { label: "Case study", href: "/projects/crazy-ride" },
    ],
  },
  {
    id: "nasa-hackathon",
    kind: "experiment",
    title: "Space Art AI — NASA Space Apps Hackathon",
    start: "2022-09",
    description:
      "Fine-tuned Stable Diffusion with Dreambooth on a cosmos artist's paintings to generate new space art in her style, built end-to-end during the NASA Space Apps Challenge.",
    media: [
      { type: "youtube", id: "qGrjl30tOAA", title: "Space Art AI" },
      { type: "image", src: "/images/projects/nasa-hackathon/image-01.jpg", alt: "Space Art AI 1" },
      { type: "image", src: "/images/projects/nasa-hackathon/image-02.jpg", alt: "Space Art AI 2" },
      { type: "image", src: "/images/projects/nasa-hackathon/image-03.jpg", alt: "Space Art AI 3" },
      { type: "image", src: "/images/projects/nasa-hackathon/image-04.jpg", alt: "Space Art AI 4" },
      { type: "image", src: "/images/projects/nasa-hackathon/image-05.jpg", alt: "Space Art AI 5" },
      { type: "image", src: "/images/projects/nasa-hackathon/image-06.jpg", alt: "Space Art AI 6" },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/MrRobert91/NASASpaceApp_Challenge_2022" },
      {
        label: "Slides (PDF)",
        href: "https://github.com/MrRobert91/NASASpaceApp_Challenge_2022/blob/develop/space_artai_documents/Space%20Artai.pdf",
      },
      { label: "Case study", href: "/projects/nasa-hackathon" },
    ],
  },
  {
    id: "13-bullets-vr",
    kind: "project",
    title: "13 Bullets in Hyperspace — VR Jam",
    start: "2022-08",
    description:
      "An action VR game made in 9 days for VRJam 2022: defeat rogue robots aboard a self-aware spaceship with only 13 bullets. Playable on Oculus Quest.",
    media: [
      { type: "youtube", id: "ZpoGPf9XQ4Q", title: "13 Bullets in Hyperspace" },
      { type: "image", src: "/images/projects/virtual-reality-game/image-01.png", alt: "13 Bullets 1" },
      { type: "image", src: "/images/projects/virtual-reality-game/image-02.png", alt: "13 Bullets 2" },
      { type: "image", src: "/images/projects/virtual-reality-game/image-03.png", alt: "13 Bullets 3" },
      { type: "image", src: "/images/projects/virtual-reality-game/image-04.png", alt: "13 Bullets 4" },
      { type: "image", src: "/images/projects/virtual-reality-game/image-05.png", alt: "13 Bullets 5" },
    ],
    links: [
      { label: "Play on itch.io", href: "https://rustyroboz.itch.io/13-bullets-in-hyperspace" },
      { label: "GitHub", href: "https://github.com/MrRobert91/13BulletsInHyperspace" },
      { label: "Case study", href: "/projects/virtual-reality-game" },
    ],
  },
  {
    id: "brain-computer-interface",
    kind: "project",
    title: "Brain-Computer Interface Project",
    start: "2022-06",
    description:
      "A Saturdays.AI capstone: piloting a drone with eye winks and bites read from a 16-channel EEG headset and classified in real time by ML models.",
    media: [
      { type: "youtube", id: "RVfkDpz1krE", title: "Brain-Computer Interface" },
      { type: "youtube", id: "ubpXxSRDCY0", title: "Brain-Computer Interface — demo" },
      { type: "image", src: "/images/projects/brain-computer-interface-project/image-01.jpg", alt: "BCI 1" },
      { type: "image", src: "/images/projects/brain-computer-interface-project/image-02.jpg", alt: "BCI 2" },
      { type: "image", src: "/images/projects/brain-computer-interface-project/image-03.jpg", alt: "BCI 3" },
      { type: "image", src: "/images/projects/brain-computer-interface-project/image-05.jpg", alt: "BCI 4" },
    ],
    links: [
      { label: "Article", href: "https://medium.com/saturdays-ai/professor-x-project-262c242311b0" },
      { label: "GitHub", href: "https://github.com/albarc3/ProfessorX-Project" },
      { label: "Presentation", href: "https://youtu.be/tdbjLsNJao8?t=4504" },
      { label: "Case study", href: "/projects/brain-computer-interface-project" },
    ],
  },
  {
    id: "ai-saturdays-course",
    kind: "course",
    title: "AI Saturdays Deep Learning Bootcamp (160 h), 5th edition",
    org: "Saturdays.AI",
    start: "2022-06",
    description:
      "Volunteer-run deep-learning bootcamp covering CNNs, autoencoders, NLP and reinforcement learning, with a group capstone (the BCI drone project).",
    media: [
      { type: "image", src: "/images/timeline/ai-saturdays-course/image-01.jpeg", alt: "AI Saturdays bootcamp 1" },
      { type: "image", src: "/images/timeline/ai-saturdays-course/image-02.jpeg", alt: "AI Saturdays bootcamp 2" },
      { type: "image", src: "/images/timeline/ai-saturdays-course/image-03.jpg", alt: "AI Saturdays bootcamp 3" },
      { type: "image", src: "/images/timeline/ai-saturdays-course/image-04.jpg", alt: "AI Saturdays bootcamp 4" },
      { type: "image", src: "/images/timeline/ai-saturdays-course/image-05.jpeg", alt: "AI Saturdays bootcamp 5" },
    ],
    links: [{ label: "Saturdays.AI", href: "https://saturdays.ai/" }],
  },
  {
    id: "there-are-more-things",
    kind: "project",
    title: "There Are More Things — Scream Jam",
    start: "2021-10",
    description:
      "My first game-jam entry: a 10-day Unity walking-sim horror for Scream Jam 2021 with hand-painted watercolor art, inspired by a Borges short story. Runs on Windows, Linux and Android.",
    media: [
      { type: "youtube", id: "8VDjRz_OP8U", title: "There Are More Things" },
      { type: "image", src: "/images/projects/there-are-more-things/image-01.png", alt: "There Are More Things 1" },
      { type: "image", src: "/images/projects/there-are-more-things/image-02.png", alt: "There Are More Things 2" },
      { type: "image", src: "/images/projects/there-are-more-things/image-03.png", alt: "There Are More Things 3" },
      { type: "image", src: "/images/projects/there-are-more-things/image-04.png", alt: "There Are More Things 4" },
      { type: "image", src: "/images/projects/there-are-more-things/image-05.png", alt: "There Are More Things 5" },
    ],
    links: [
      { label: "Play", href: "https://rustyroboz.itch.io/there-are-more-things" },
      { label: "Case study", href: "/projects/there-are-more-things" },
    ],
  },
  {
    id: "huawei-ai-hackathon",
    kind: "project",
    title: "Huawei AI Hackathon — DemocrAI",
    start: "2021-09",
    description:
      "“DemocrAI”: a proof of concept for democratizing AI on mobile devices — running Tensorflow models on-device, with an app-plus-SDK flow connecting users and developers. Built for the Huawei AI hackathon.",
    media: [
      { type: "image", src: "/images/projects/huawei-ai-hackathon/image-01.png", alt: "DemocrAI — title" },
      { type: "image", src: "/images/projects/huawei-ai-hackathon/image-02.png", alt: "DemocrAI — how it works" },
      { type: "image", src: "/images/projects/huawei-ai-hackathon/image-03.png", alt: "DemocrAI — AI in your pocket" },
      { type: "image", src: "/images/projects/huawei-ai-hackathon/image-04.png", alt: "DemocrAI — demo" },
    ],
  },
  {
    id: "structuring-ml-coursera",
    kind: "course",
    title: "Structuring Machine Learning Projects",
    org: "Coursera (DeepLearning.AI)",
    start: "2021-09",
    description:
      "Course on how to set direction for ML projects — error analysis, mismatched data, transfer and multi-task learning.",
    media: [{ type: "image", src: "/images/timeline/structuring-ml-coursera/image-01.png", alt: "Structuring ML Projects certificate" }],
    links: [{ label: "Coursera", href: "https://www.coursera.org/learn/machine-learning-projects" }],
  },
  {
    id: "nft-collection",
    kind: "project",
    title: "NFT Collection: AI Art + Quantum",
    start: "2021-08",
    description:
      "A 42-piece NFT collection of AI-generated “Rusty Robozs” (VQGAN+CLIP), with each price set by a quantum random-number generator on IBM Q, minted on OpenSea.",
    media: [
      { type: "image", src: "/images/projects/nft-collection-ai-art-quantum/image-01.png", alt: "NFT Collection 1" },
      { type: "image", src: "/images/projects/nft-collection-ai-art-quantum/image-02.png", alt: "NFT Collection 2" },
    ],
    links: [
      { label: "OpenSea", href: "https://opensea.io/collection/rusty-robozs" },
      { label: "Case study", href: "/projects/nft-collection-ai-art-quantum" },
    ],
  },
  {
    id: "quantum-random-number-generator",
    kind: "experiment",
    title: "Quantum Random Number Generator",
    start: "2021-08",
    description:
      "A Qiskit experiment that puts five qubits into superposition, measures them and maps the resulting bit string to random NFT prices generated by quantum events.",
    media: [
      { type: "youtube", id: "q_oOZxcR1NA", title: "Quantum Random Number Generator" },
      {
        type: "image",
        src: "/images/projects/quantum-random-number-generator/image-01.png",
        alt: "Quantum Random Number Generator",
      },
    ],
    links: [{ label: "Case study", href: "/projects/quantum-random-number-generator" }],
  },
  {
    id: "art-made-with-ai",
    kind: "experiment",
    title: "Art Made with Artificial Intelligence",
    start: "2021-08",
    description:
      "Months of experiments with VQGAN+CLIP and prompt engineering, building the “Rusty Roboz” visual universe from a single sketch.",
    media: [{ type: "youtube", id: "u7vk3WKPUgQ", title: "Art Made with AI" }],
    links: [
      { label: "Article", href: "https://medium.com/@rustyroboz/art-made-with-artificial-intelligence-db088e722532" },
      { label: "Instagram", href: "https://www.instagram.com/ai_art_roboz/" },
      { label: "Case study", href: "/projects/art-made-with-artificial-intelligence" },
    ],
  },
  {
    id: "toxic-adventure",
    kind: "experiment",
    title: "Toxic Adventure",
    start: "2021-05",
    description:
      "A compact Unity platform game for Android where radioactive-waste barrels appear around the level and the player must collect all 50 without falling.",
    media: [
      { type: "youtube", id: "gillrGqszC0", title: "Toxic Adventure" },
      { type: "image", src: "/images/projects/toxic-adventure/image-01.jpg", alt: "Toxic Adventure" },
    ],
    links: [{ label: "Case study", href: "/projects/toxic-adventure" }],
  },
  {
    id: "rpi-console",
    kind: "experiment",
    title: "RPI Console",
    start: "2021-01",
    description:
      "A portable retro console built on a Raspberry Pi 3 with RetroPie and a 3.5-inch screen — emulating NES, SNES, Mega Drive, GBA and more on the go.",
    media: [
      { type: "image", src: "/images/projects/rpi-console/image-01.jpg", alt: "RPI Console 1" },
      { type: "image", src: "/images/projects/rpi-console/image-02.jpg", alt: "RPI Console 2" },
      { type: "image", src: "/images/projects/rpi-console/image-03.jpg", alt: "RPI Console 3" },
      { type: "image", src: "/images/projects/rpi-console/image-04.jpg", alt: "RPI Console 4" },
    ],
    links: [{ label: "Case study", href: "/projects/rpi-console" }],
  },
  {
    id: "face-recognition-and-tracking-with-opencv",
    kind: "experiment",
    title: "Face Recognition and Tracking with OpenCV",
    start: "2019-02",
    description:
      "A small computer-vision experiment combining OpenCV face detection, face recognition and live tracking from a camera feed.",
    media: [{ type: "youtube", id: "8ga6g6btSH0", title: "Face recognition and tracking with OpenCV" }],
    links: [{ label: "Case study", href: "/projects/face-recognition-and-tracking-with-opencv" }],
  },
  {
    id: "stratio",
    kind: "experience",
    title: "ML Engineer / Data Scientist",
    org: "Stratio, Madrid",
    start: "2018-09",
    end: "2022-10",
    description:
      "Built AI solutions across R&D, AutoML and advanced-analytics teams in large-scale environments: voice and chatbot assistants, real-time computer-vision models, and an integrated AutoML solution for training and deploying ML in Big Data.",
    links: [{ label: "Stratio", href: "https://www.stratio.com/" }],
  },
  {
    id: "tfg-traffic-signs",
    kind: "project",
    title: "TFG — Recognition of traffic-sign images with deep learning",
    org: "Universidad Rey Juan Carlos",
    start: "2018-07",
    description:
      "Bachelor's thesis: recognizing traffic-sign images with convolutional neural networks and deep-learning techniques.",
    media: [
      { type: "youtube", id: "zPINu6zXo9A", title: "Traffic-sign recognition" },
      { type: "image", src: "/images/projects/recognition-of-traffic-signal-images-with-deep-learning/image-01.png", alt: "Traffic-sign recognition 1" },
      { type: "image", src: "/images/projects/recognition-of-traffic-signal-images-with-deep-learning/image-02.png", alt: "Traffic-sign recognition 2" },
      { type: "image", src: "/images/projects/recognition-of-traffic-signal-images-with-deep-learning/image-03.png", alt: "Traffic-sign recognition 3" },
    ],
    links: [
      { label: "GitHub", href: "https://github.com/MrRobert91/traffic_sign_machine_learning/tree/master" },
      { label: "Case study", href: "/projects/recognition-of-traffic-signal-images-with-deep-learning" },
    ],
  },
  {
    id: "degree",
    kind: "education",
    title: "BSc in Computer Engineering",
    org: "Universidad Rey Juan Carlos",
    start: "2018-07",
    description: "Final project (TFG) on training convolutional neural networks.",
  },
  {
    id: "arduino-safe-brake-ligths",
    kind: "experiment",
    title: "Arduino Safe Brake Lights",
    start: "2018-04",
    description:
      "A hardware prototype for adaptive car brake lights: an Arduino and pressure sensor illuminate more LEDs as braking intensity increases.",
    media: [
      { type: "youtube", id: "8dDxJtqwpl8", title: "Arduino safe brake lights" },
      {
        type: "image",
        src: "/images/projects/arduino-safe-brake-ligths/image-01.jpg",
        alt: "Arduino Safe Brake Lights prototype",
      },
    ],
    links: [{ label: "Case study", href: "/projects/arduino-safe-brake-ligths" }],
  },
  {
    id: "drone-programming-course",
    kind: "course",
    title: "Advanced University Course in Drone Programming",
    org: "Universidad Rey Juan Carlos",
    start: "2018-02",
    description: "University extension course on programming and controlling drones.",
    media: [
      { type: "youtube", id: "qGxOLXtzfNc", title: "Drone programming 1" },
      { type: "youtube", id: "6Uuh7DfmfPw", title: "Drone programming 2" },
      { type: "youtube", id: "cAgejgrsRuM", title: "Drone programming 3" },
      { type: "image", src: "/images/timeline/drone-programming-course/image-01.jpg", alt: "Drone programming course" },
    ],
  },
  {
    id: "drone-contest",
    kind: "project",
    title: "1st place — Programarobot Drone Contest",
    org: "URJC ETSIT",
    start: "2017-07",
    description:
      "Won first place programming a drone to chase another in simulation (Gazebo + JdeRobot). Prize: a Parrot Mambo mini-drone.",
    media: [
      { type: "youtube", id: "8odOHBdqlOQ", title: "Drone contest 1" },
      { type: "youtube", id: "1Fm3TLNSYU8", title: "Drone contest 2" },
      { type: "youtube", id: "7wboJ-T6txw", title: "Drone contest 3" },
      { type: "image", src: "/images/projects/drone-programming-contest/image-01.jpg", alt: "Drone contest 1" },
      { type: "image", src: "/images/projects/drone-programming-contest/image-02.jpg", alt: "Drone contest 2" },
    ],
    links: [
      {
        label: "URJC news",
        href: "https://www.urjc.es/todas-las-noticias-de-actualidad-cientifica/2621-finaliza-la-segunda-edicion-del-campeonato-de-programacion-de-robots-programarobot",
      },
      { label: "Case study", href: "/projects/drone-programming-contest" },
    ],
  },
  {
    id: "robotics-course",
    kind: "course",
    title: "Advanced University Course in Robotics",
    org: "Universidad Rey Juan Carlos",
    start: "2017-04",
    description: "University extension course in robotics.",
    media: [{ type: "image", src: "/images/timeline/robotics-course/image-01.jpg", alt: "Advanced robotics course" }],
  },
  {
    id: "future-space",
    kind: "experience",
    title: "Software Developer",
    org: "Future Space, Madrid",
    start: "2015-02",
    end: "2016-04",
    description:
      "Backend development of document-management applications with DRM and insurance-sector solutions, plus web features and online stores integrated with external systems (Java, PHP, MySQL, JavaScript).",
  },
];

/** Most recent entries, for compact previews (e.g. the home page). */
export function getRecentTimeline(limit = 5) {
  return timeline.slice(0, limit);
}
