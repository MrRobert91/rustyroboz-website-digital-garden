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
    { href: "/chat", label: "Chat" },
  ],
  socialLinks: [
    { href: "https://www.instagram.com/rustyroboz/", label: "Instagram" },
    { href: "https://github.com/MrRobert91", label: "GitHub" },
    { href: "https://www.linkedin.com/in/david-robert/", label: "LinkedIn" },
    { href: "https://medium.com/@rustyroboz", label: "Medium" },
  ],
  // Work experience — rendered on the LEFT of the timeline. Each entry's height
  // is proportional to its duration (start/end are decimal years, e.g. Oct = 2022.75).
  // Use end: "present" for the current role.
  experience: [
    {
      role: "Lead AI Instructor",
      company: "Factoría F5",
      start: 2022.75,
      end: "present" as const,
      startLabel: "Oct 2022",
      endLabel: "Present",
      description:
        "Leading AI/ML training: agentic AI, LLM fine-tuning, RAG, LLM observability and evaluation, NLP, and computer vision.",
    },
    {
      role: "ML Engineer / Data Scientist",
      company: "Stratio",
      start: 2018,
      end: 2022,
      startLabel: "2018",
      endLabel: "2022",
      description: "Machine learning models and data pipelines on a big-data platform.",
    },
    {
      role: "Software Developer",
      company: "Future Space",
      start: 2015,
      end: 2016,
      startLabel: "2015",
      endLabel: "2016",
      description: "Backend services and internal tooling across software projects.",
    },
  ],
  // Projects, courses, certifications, milestones — rendered on the RIGHT of the
  // timeline, anchored to the year they happened. Edit / add freely.
  milestones: [
    {
      year: 2026,
      type: "Certification",
      title: "Azure AI Engineer (AI-103)",
      detail: "In progress — exam scheduled July 2026.",
    },
    {
      year: 2026,
      type: "Certification",
      title: "Qiskit certification",
      detail: "In progress — AI × quantum computing.",
    },
    {
      year: 2024,
      type: "Certification",
      title: "Azure AI Engineer Associate (AI-102)",
      detail: "Microsoft Certified — issued Apr 2024.",
    },
    {
      year: 2015,
      type: "Education",
      title: "BSc Computer Engineering",
      detail: "Universidad Rey Juan Carlos.",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
