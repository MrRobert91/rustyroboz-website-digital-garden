export const siteConfig = {
  name: "David Robert",
  title: "David Robert | Projects, articles, and experiments",
  description:
    "Personal site by David Robert, a computer engineer based in Madrid, with projects in AI, VR, games, quantum computing, and software experiments.",
  location: "Madrid, Spain",
  email: "",
  navigation: [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/projects", label: "Projects" },
    { href: "/articles", label: "Articles" },
    { href: "/contact", label: "Contact" },
    { href: "/lab", label: "AI Lab" },
  ],
  socialLinks: [
    { href: "https://www.instagram.com/rustyroboz/", label: "Instagram" },
    { href: "https://github.com/MrRobert91", label: "GitHub" },
    { href: "https://www.linkedin.com/in/david-robert/", label: "LinkedIn" },
    { href: "https://medium.com/@rustyroboz", label: "Medium" },
  ],
  timeline: [
    {
      period: "Base",
      title: "Computer engineer based in Madrid",
      description:
        "Interested in robotics, machine learning, artificial intelligence, quantum computing, game development, and technology in general.",
    },
    {
      period: "Focus",
      title: "Projects with real technical edges",
      description:
        "The work spans VR prototypes, AI art, chatbots, game jams, embedded hardware, and computer vision experiments.",
    },
    {
      period: "Public work",
      title: "Writing and experiments in public",
      description: "The site combines project work, articles, notes, and a small AI chat layer in one place.",
    },
  ],
  // Toolbox — grouped tech, drawn as handwritten chips.
  stack: [
    { title: "AI / ML", items: ["PyTorch", "LangChain", "OpenAI", "HF", "FAISS", "vLLM", "Ollama", "Pinecone"] },
    { title: "Software", items: ["TypeScript", "Python", "Next.js", "FastAPI", "Postgres", "Docker", "Vercel"] },
    { title: "Hardware", items: ["ESP32", "Arduino", "ROS", "RPi", "Solder", "PCB", "3D-print"] },
    { title: "Games / XR", items: ["Unity", "C#", "Unreal", "Blender", "OpenXR"] },
  ],
  // Working principles, nailed to the workshop wall.
  principles: [
    { title: "Ship rusty", description: "Imperfect & on the bench beats perfect & in the head." },
    { title: "Read the source", description: "If it has weights, read the loss curve before the README." },
    { title: "Write things down", description: "Notebook is a tool. So is the soldering iron." },
  ],
  // Things I can build — hand-drawn checklist on the About page.
  capabilities: [
    "RAG / retrieval pipelines",
    "Small LLM agents",
    "Computer vision modules",
    "ROS robots & embedded fw",
    "VR / Unity prototypes",
    "Quantum algorithm sketches",
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
