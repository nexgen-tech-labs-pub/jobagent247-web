import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JobAgent247 — AI-Powered Job Search",
  description:
    "Your personal AI job-search agent. Get tailored CVs, smart job matches, interview prep, and application tracking — all in one intelligent platform.",
  keywords: [
    "AI job search",
    "CV builder",
    "job matching",
    "interview preparation",
    "application tracker",
    "career tools",
  ],
  openGraph: {
    title: "JobAgent247 — AI-Powered Job Search",
    description:
      "Get more interviews with your personal AI job-search agents.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full antialiased">
        <Script id="theme-init" strategy="beforeInteractive" src="/theme-init.js" />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
