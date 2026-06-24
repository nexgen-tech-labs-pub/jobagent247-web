import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { HelpChat } from "@/components/help/HelpChat";

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
        <script type="application/ld+json" suppressHydrationWarning>
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': 'https://jobagent247.co/#organization',
            name: 'JobAgent247',
            alternateName: 'Job Agent 247',
            url: 'https://jobagent247.co',
            logo: 'https://jobagent247.co/jobagent-logo-dark.png',
            description:
              'AI-powered job-search platform. Ten specialised agents score and rewrite CVs against any job description, find matching live jobs from 50+ UK and Indian job sites, draft tailored cover letters, and prepare you for interviews.',
            sameAs: ['https://jobagent247.co/in'],
            areaServed: ['GB', 'IN', 'US'],
            knowsAbout: [
              'AI job search',
              'ATS optimisation',
              'CV writing',
              'cover letter writing',
              'interview preparation',
              'job matching',
            ],
          })}
        </script>
        <Script id="theme-init" strategy="beforeInteractive" src="/theme-init.js" />
        <ThemeProvider>
          {children}
          <HelpChat />
        </ThemeProvider>
      </body>
    </html>
  );
}
