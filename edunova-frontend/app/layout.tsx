import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Fredoka, Nunito } from "next/font/google";
import { RegistrarServiceWorker } from "@/components/ui/RegistrarServiceWorker";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "EduNova: aprender puede ser una aventura",
  description:
    "Plataforma educativa interactiva para niños y adolescentes, basada en el Currículo Nacional del MINEDU.",
};

export const viewport: Viewport = {
  themeColor: "#5636d9",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${nunito.variable} ${fredoka.variable} ${atkinson.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
