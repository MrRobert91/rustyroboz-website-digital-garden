export const siteConfig = {
  name: "David Robert",
  title: "David Robert | AI Engineer · Computer Engineer",
  description:
    "Personal site and portfolio of David Robert, an AI Engineer and Computer Engineer based in Madrid, with work across AI systems, training, VR, games, quantum computing, and software experiments.",
  location: "Madrid, Spain",
  email: "davidrobertnunez@gmail.com",
  navigation: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/timeline", label: "Timeline" },
    { href: "/projects", label: "Projects" },
    { href: "/articles", label: "Articles" },
    { href: "/contact", label: "Contact" },
  ],
  socialLinks: [
    { href: "https://www.instagram.com/rustyroboz/", label: "Instagram" },
    { href: "https://github.com/MrRobert91", label: "GitHub" },
    { href: "https://www.linkedin.com/in/david-robert/", label: "LinkedIn" },
    { href: "https://medium.com/@rustyroboz", label: "Medium" },
  ],
  // Toolbox — grouped tech, drawn as handwritten chips.
  stack: [
    {
      title: "AI / ML",
      items: [
        "LangChain/LangGraph",
        "LangSmith",
        "Unsloth",
        "OpenAI",
        "Hugging Face",
        "FAISS",
        "vLLM",
        "Ollama",
        "Pinecone",
        "Chroma DB",
        "CrewAI",
        "Scikit-learn",
        "pandas",
        "PyTorch",
        "TensorFlow",
        "YOLO",
        "MLflow",
        "Optuna",
      ],
    },
    {
      title: "Software",
      items: [
        "Python",
        "FastAPI",
        "Postgres",
        "MongoDB",
        "SQLite",
        "MySQL",
        "Docker",
        "Kubernetes",
        "Spark",
        "git/GitHub",
        "Kafka",
      ],
    },
    { title: "Hardware", items: ["Arduino", "Raspberry Pi", "protoboard"] },
    {
      title: "Games / XR",
      items: ["Unity", "C#", "OpenXR", "Godot", "Three.js", "NeRF/Gaussian Splatting", "3D model generation"],
    },
  ],
  // Things I can do — hand-drawn checklist on the About page.
  capabilities: [
    "RAG / retrieval pipelines",
    "LLM agents",
    "Computer vision modules",
    "VR / Unity prototypes",
    "AI classes for all audiences",
  ],
};

// Map a project's lifecycle status to a rubber-stamp label.
export const projectStatusStamp: Record<string, string> = {
  completed: "SHIPPED",
  active: "BENCH",
  planned: "BETA",
  archived: "EXPERIMENT",
};

export type SiteConfig = typeof siteConfig;
