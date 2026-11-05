import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EduNova: aprender puede ser una aventura",
    short_name: "EduNova",
    description: "Lecciones, juegos y laboratorios 3D para niños y adolescentes, también sin internet.",
    lang: "es",
    start_url: "/estudiante",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#5636d9",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
