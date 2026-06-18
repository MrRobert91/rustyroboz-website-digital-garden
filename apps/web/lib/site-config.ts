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
    { href: "/lab", label: "AI Lab" },
    { href: "/chat", label: "Chat" },
  ],
  socialLinks: [
    { href: "https://www.instagram.com/rustyroboz/", label: "Instagram" },
    { href: "https://github.com/MrRobert91", label: "GitHub" },
    { href: "https://www.linkedin.com/in/david-robert/", label: "LinkedIn" },
    { href: "https://medium.com/@rustyroboz", label: "Medium" },
  ],
};

export type SiteConfig = typeof siteConfig;
