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
  timeline: [
    {
      period: "Now",
      title: "AI Engineer & Lead AI Instructor",
      description:
        "9 years in tech and 3.5+ years designing and delivering AI bootcamps. Focused on Agentic AI, LLM fine-tuning, RAG architectures, and LLM observability and evaluation.",
    },
    {
      period: "Track record",
      title: "From proof of concept to production",
      description:
        "Built AI solutions across R&D, AutoML, and advanced analytics in Big Data and Cloud environments, and trained several hundred students across all levels.",
    },
    {
      period: "Maker side",
      title: "Projects with real technical edges",
      description:
        "Beyond work, the site spans VR prototypes, AI art, chatbots, game jams, embedded hardware, and computer vision experiments — built and shared in public.",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
