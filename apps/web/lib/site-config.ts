export const siteConfig = {
  name: "rustyroboz",
  title: "Rustyroboz | Personal web, digital garden y AI lab",
  description:
    "Web personal en español sobre producto, ingeniería, sistemas complejos, IA aplicada y pensamiento público.",
  location: "Madrid · remoto",
  email: "hola@rustyroboz.dev",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
  navigation: [
    { href: "/", label: "Inicio" },
    { href: "/about", label: "Sobre mí" },
    { href: "/projects", label: "Proyectos" },
    { href: "/articles", label: "Artículos" },
    { href: "/notes", label: "Digital Garden" },
    { href: "/lab", label: "AI Lab" },
    { href: "/chat", label: "Chat" },
  ],
  socialLinks: [
    { href: "https://github.com/rustyroboz", label: "GitHub" },
    { href: "https://www.linkedin.com/in/rustyroboz", label: "LinkedIn" },
    { href: "mailto:hola@rustyroboz.dev", label: "Email" },
  ],
  timeline: [
    {
      period: "Hoy",
      title: "Producto, ingeniería e investigación aplicada",
      description:
        "Diseño productos y sistemas donde conviven contenido, experiencia de usuario y capacidades de IA.",
    },
    {
      period: "Antes",
      title: "Software con foco en sistemas complejos",
      description:
        "He trabajado entre web, datos y automatización, intentando mantener el equilibrio entre rigor técnico y claridad de producto.",
    },
    {
      period: "Siempre",
      title: "Pensamiento público",
      description:
        "Uso este sitio para publicar proyectos, notas y artículos donde conecto tecnología, ética, filosofía y diseño de sistemas.",
    },
  ],
};

export type SiteConfig = typeof siteConfig;

