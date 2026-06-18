export type TimelineKind =
  | "experience"
  | "education"
  | "certification"
  | "course"
  | "award"
  | "project";

export type TimelineLink = {
  label: string;
  href: string;
};

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
  links?: TimelineLink[];
};

const KIND_LABELS: Record<TimelineKind, string> = {
  experience: "Experience",
  education: "Education",
  certification: "Certification",
  course: "Course",
  award: "Award",
  project: "Project",
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
    links: [{ label: "Sample project", href: "/projects/technical-interview-chatbot" }],
  },
  {
    id: "sharedbrain",
    kind: "project",
    title: "SharedBrain",
    start: "2026-06",
    description:
      "A personal context layer for AI agents that turns scattered notes (Obsidian vaults, project repos) into actionable context. Read-only over your notes with AI output isolated in an `_ai/` folder, an MCP server for agent queries, CLI pipelines and a React dashboard. FastAPI + FastMCP + pydantic-ai backend.",
    links: [
      { label: "Live app", href: "https://sharedbrain.sliplane.app/" },
      { label: "GitHub", href: "https://github.com/MrRobert91/SharedBrain" },
    ],
  },
  {
    id: "topokarts",
    kind: "project",
    title: "TopoKarts",
    start: "2026-06",
    description:
      "A 3D arcade racer in the browser where geometric creatures race on topological surfaces — Möbius strips, tori and hyperbolic planes. 100% procedural geometry, textures and audio with Three.js. Trailer made with Fable 5.",
    links: [
      { label: "Video", href: "https://www.youtube.com/watch?v=1PtB9z2Beow" },
      { label: "GitHub", href: "https://github.com/MrRobert91/TopoKarts" },
    ],
  },
  {
    id: "mira-link",
    kind: "project",
    title: "Mira Link",
    start: "2026-05",
    description:
      "An accessibility web app that lets people with severe mobility impairments fill in Google Forms and Microsoft Forms using only eye-gaze control — webcam eye tracking with MediaPipe, guided calibration, dwell-based Yes/No selection and text-to-speech. React + Vite frontend, FastAPI + SQLite + Piper backend.",
    links: [
      { label: "Website", href: "https://miralink.app/" },
      { label: "GitHub", href: "https://github.com/MrRobert91/MiraLink" },
    ],
  },
  {
    id: "socratic-gemma",
    kind: "project",
    title: "Socratic Gemma — Gemma 4 Good Hackathon",
    start: "2026-05",
    description:
      "Hackathon submission: a Socratic tutoring assistant built on Google's Gemma models, entered in the Kaggle “Gemma 4 Good” hackathon.",
    links: [
      {
        label: "Writeup",
        href: "https://www.kaggle.com/competitions/gemma-4-good-hackathon/writeups/new-writeup-1779100810809",
      },
    ],
  },
  {
    id: "apolo-vs-zeus",
    kind: "project",
    title: "Apolo vs Zeus",
    start: "2026-05",
    description:
      "A browser arcade game: play as Apollo dodging Zeus's lightning bolts, scoring a point for every dodge. Keyboard or touch controls.",
    links: [{ label: "Play", href: "https://juego-zeus-y-apolo.sliplane.app/" }],
  },
  {
    id: "thor-runner",
    kind: "project",
    title: "Thor Runner",
    start: "2026-04",
    description:
      "An endless-runner / action platformer where you play Thor, battling enemies and obstacles from Norse mythology. Playable in the browser.",
    links: [{ label: "Play", href: "https://rustyroboz.itch.io/thor-runner" }],
  },
  {
    id: "cartastrofe",
    kind: "project",
    title: "Cartastrofe → Google Play",
    start: "2026-02",
    description:
      "A card game for couples built in Flutter, revived from a dusty MVP and taken through the full Google Play release pipeline — signed App Bundle, store listing, privacy policy and a closed-beta waitlist with MailerLite.",
    links: [
      { label: "Website", href: "https://www.cartastrofe.com/" },
      { label: "itch.io", href: "https://rustyroboz.itch.io/cartastrofe" },
      { label: "GitHub", href: "https://github.com/MrRobert91/juego_cartas" },
      {
        label: "Article: revival",
        href: "/articles/de-mvp-cogiendo-polvo-a-google-play-la-resurreccion-de-cartastrofe",
      },
      {
        label: "Article: 12 testers",
        href: "/articles/12-testers-14-dias-y-un-subreddit-asi-publique-mi-primera-app-en-google-play",
      },
    ],
  },
  {
    id: "technical-interview-chatbot",
    kind: "project",
    title: "Technical Interview Chatbot",
    start: "2024-12",
    description:
      "An LLM chatbot that simulates a technical interviewer — asks questions based on your experience, gives feedback and exports a PDF. Built with LangChain, Groq (Llama 3.1 70B) and Streamlit.",
    links: [
      { label: "Live demo", href: "https://chatbot-llm-interview.streamlit.app/" },
      { label: "GitHub", href: "https://github.com/MrRobert91/StreamlitLLMChatbot" },
      { label: "Case study", href: "/projects/technical-interview-chatbot" },
    ],
  },
  {
    id: "azure-ai-engineer",
    kind: "certification",
    title: "Microsoft Certified: Azure AI Engineer Associate",
    org: "Microsoft (AI-102)",
    start: "2024-04",
    description:
      "Cloud certification for designing and deploying AI solutions on Azure. Valid through Apr 2027. Credential ID B14F86A8D09444D3.",
  },
  {
    id: "who-is-moloch",
    kind: "project",
    title: "Who is Moloch — Metroidvania Jam",
    start: "2023-03",
    description:
      "A metroidvania built for Metroidvania Month Jam 19 with every asset generated by AI (Midjourney, DALL·E 2): bone-based animation, AI backgrounds and a story inspired by the game-theory concept of “Moloch”.",
    links: [
      { label: "Play", href: "https://rustyroboz.itch.io/who-is-moloch" },
      { label: "Video", href: "https://www.youtube.com/watch?v=BsFxKXcSCFY" },
      { label: "Case study", href: "/projects/metroidvania-game-using-ai-generated-art" },
    ],
  },
  {
    id: "low-cost-vr-digital-twin",
    kind: "project",
    title: "Low Cost VR Digital Twin",
    start: "2022-11",
    description:
      "A low-cost VR digital twin: 3D-scanning a real room with a phone and AI models, rebuilt as an interactive Oculus Quest 2 experience in Unity.",
    links: [
      { label: "Play / Download", href: "https://rustyroboz.itch.io/low-cost-vr-digital-twin" },
      { label: "Case study", href: "/projects/low-cost-vr-digital-twin" },
    ],
  },
  {
    id: "crazy-ride",
    kind: "project",
    title: "Crazy Ride",
    start: "2022-11",
    description:
      "A simple Unity 3D arcade driving game for Android — dodge obstacles across levels with two-button controls. No brakes here.",
    links: [
      { label: "Play", href: "https://rustyroboz.itch.io/crazy-ride" },
      { label: "Case study", href: "/projects/crazy-ride" },
    ],
  },
  {
    id: "nasa-hackathon",
    kind: "project",
    title: "Space Art AI — NASA Space Apps Hackathon",
    start: "2022-09",
    description:
      "Fine-tuned Stable Diffusion with Dreambooth on a cosmos artist's paintings to generate new space art in her style, built end-to-end during the NASA Space Apps Challenge.",
    links: [
      { label: "GitHub", href: "https://github.com/MrRobert91/NASASpaceApp_Challenge_2022" },
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
    links: [
      { label: "Play", href: "https://drobert.itch.io/13-bullets-in-hyperspace" },
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
    title: "AI Saturdays Deep Learning Bootcamp (160 h)",
    org: "Saturdays.AI",
    start: "2022-06",
    description:
      "Volunteer-run deep-learning bootcamp covering CNNs, autoencoders, NLP and reinforcement learning, with a group capstone (the BCI drone project).",
    links: [{ label: "Saturdays.AI", href: "https://saturdays.ai/" }],
  },
  {
    id: "there-are-more-things",
    kind: "project",
    title: "There Are More Things — Scream Jam",
    start: "2021-10",
    description:
      "My first game-jam entry: a 10-day Unity walking-sim horror for Scream Jam 2021 with hand-painted watercolor art, inspired by a Borges short story. Runs on Windows, Linux and Android.",
    links: [
      { label: "Play", href: "https://rustyroboz.itch.io/there-are-more-things" },
      { label: "Case study", href: "/projects/there-are-more-things" },
    ],
  },
  {
    id: "huawei-ai-hackathon",
    kind: "project",
    title: "Huawei AI Hackathon",
    start: "2021-09",
    description: "Participated in an AI hackathon organized by Huawei.",
  },
  {
    id: "structuring-ml-coursera",
    kind: "course",
    title: "Structuring Machine Learning Projects",
    org: "Coursera (DeepLearning.AI)",
    start: "2021-09",
    description:
      "Course on how to set direction for ML projects — error analysis, mismatched data, transfer and multi-task learning.",
    links: [{ label: "Coursera", href: "https://www.coursera.org/learn/machine-learning-projects" }],
  },
  {
    id: "nft-collection",
    kind: "project",
    title: "NFT Collection: AI Art + Quantum",
    start: "2021-08",
    description:
      "A 42-piece NFT collection of AI-generated “Rusty Robozs” (VQGAN+CLIP), with each price set by a quantum random-number generator on IBM Q, minted on OpenSea.",
    links: [
      { label: "OpenSea", href: "https://opensea.io/collection/rusty-robozs" },
      { label: "Case study", href: "/projects/nft-collection-ai-art-quantum" },
    ],
  },
  {
    id: "art-made-with-ai",
    kind: "project",
    title: "Art Made with Artificial Intelligence",
    start: "2021-08",
    description:
      "Months of experiments with VQGAN+CLIP and prompt engineering, building the “Rusty Roboz” visual universe from a single sketch.",
    links: [
      {
        label: "Article",
        href: "https://medium.com/@rustyroboz/art-made-with-artificial-intelligence-db088e722532",
      },
      { label: "Instagram", href: "https://www.instagram.com/rustyroboz/" },
      { label: "Case study", href: "/projects/art-made-with-artificial-intelligence" },
    ],
  },
  {
    id: "rpi-console",
    kind: "project",
    title: "RPI Console",
    start: "2020-10",
    description:
      "A portable retro console built on a Raspberry Pi 3 with RetroPie and a 3.5-inch screen — emulating NES, SNES, Mega Drive, GBA and more on the go.",
    links: [{ label: "Case study", href: "/projects/rpi-console" }],
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
    id: "degree",
    kind: "education",
    title: "BSc in Computer Engineering",
    org: "Universidad Rey Juan Carlos",
    start: "2018-07",
    description:
      "Final project (TFG) on training convolutional neural networks.",
  },
  {
    id: "drone-programming-course",
    kind: "course",
    title: "Advanced University Course in Drone Programming",
    org: "Universidad Rey Juan Carlos",
    start: "2018-02",
    description: "University extension course on programming and controlling drones.",
  },
  {
    id: "drone-contest",
    kind: "award",
    title: "1st place — Programarobot Drone Contest",
    org: "URJC ETSIT",
    start: "2017-05",
    description:
      "Won first place programming a drone to chase another in simulation (Gazebo + JdeRobot). Prize: a Parrot Mambo mini-drone.",
    links: [{ label: "Case study", href: "/projects/drone-programming-contest" }],
  },
  {
    id: "robotics-course",
    kind: "course",
    title: "Advanced University Course in Robotics",
    org: "Universidad Rey Juan Carlos",
    start: "2017-04",
    description: "University extension course in robotics.",
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
