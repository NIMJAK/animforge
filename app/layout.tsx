import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AnimForge",
  description:
    "A creative collaboration platform for animators, artists, writers, voice actors and animation teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
