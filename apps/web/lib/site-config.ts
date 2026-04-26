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
};

export type SiteConfig = typeof siteConfig;
