import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://animforge.vercel.app"
  ),

  title: {
    default:
      "AnimForge — Create Animation Together",
    template:
      "%s | AnimForge",
  },

  description:
    "AnimForge is a collaboration platform for animators, writers, artists, voice actors and creative teams to develop stories, build characters and produce animation together.",

  keywords: [
    "animation",
    "animators",
    "animation collaboration",
    "animation projects",
    "storyboard",
    "character design",
    "animation community",
    "AnimForge",
  ],

  applicationName:
    "AnimForge",

  authors: [
    {
      name: "AnimForge",
    },
  ],

  creator:
    "AnimForge",

  openGraph: {
    type: "website",
    url:
      "https://animforge.vercel.app",
    siteName:
      "AnimForge",
    title:
      "AnimForge — Create Animation Together",
    description:
      "Find creators, develop stories, build characters and produce animation together.",
  },

  twitter: {
    card:
      "summary_large_image",
    title:
      "AnimForge — Create Animation Together",
    description:
      "A creative collaboration platform built for animation creators.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
    >
      <body>
        {children}
      </body>
    </html>
  );
}
