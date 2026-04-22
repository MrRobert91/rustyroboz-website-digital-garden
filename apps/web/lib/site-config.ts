export const siteConfig = {
  name: "rustyroboz",
  title: "Rustyroboz | Projects, articles and experiments by David Robert",
  description:
    "Personal site by David Robert, computer engineer based in Madrid, with projects in AI, VR, games, quantum computing and software experiments.",
  location: "Madrid · Spain",
  email: "",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
  navigation: [
    { href: "/", label: "Inicio" },
    { href: "/about", label: "Sobre mí" },
    { href: "/projects", label: "Proyectos" },
    { href: "/articles", label: "Artículos" },
    { href: "/contact", label: "Contacto" },
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
        "Interested in Big Data, Robotics, Functional Programming, Machine Learning, Artificial Intelligence, Quantum Computing, Game Development and Technology in general.",
    },
    {
      period: "Focus",
      title: "Projects with real technical edges",
      description:
        "The archive spans VR prototypes, AI art, chatbots, game jams, embedded hardware and computer vision experiments.",
    },
    {
      period: "Public layer",
      title: "Articles and experiments in public",
      description:
        "The site now combines the previous Rustyroboz portfolio, Medium writing and the current AI chat layer in one place.",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
