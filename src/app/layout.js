import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });

const SITE = "https://nextfrontiersystem.com";
const DESCRIPTION =
  "Next Frontier Systems is a U.S. deep-technology company engineering the next generation of intelligent systems — AI, scientific simulation, digital twins, telecommunications and enterprise platforms.";

export const metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Next Frontier Systems | Engineering the Next Generation of Intelligent Systems",
    template: "%s | Next Frontier Systems",
  },
  description: DESCRIPTION,
  applicationName: "Next Frontier Systems",
  keywords: [
    "deep tech", "artificial intelligence", "AI agents", "digital twins",
    "scientific simulation", "telecommunications", "OSS/BSS", "enterprise software",
    "cloud engineering", "medical AI", "quantum computing", "Next Frontier Systems",
    "Jean Claude Morales", "Jean Claude Morales engineer",
    "Jean Claude Morales Next Frontier Systems", "Next Frontier Systems founder",
    "engineering intelligent systems", "applied AI engineering",
  ],
  authors: [{ name: "Jean Claude Morales", url: `${SITE}/#jean-claude-morales` }],
  creator: "Jean Claude Morales",
  publisher: "Next Frontier Systems LLC",
  alternates: { canonical: "/", languages: { "en-US": "/", "es-ES": "/" } },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Next Frontier Systems",
    title: "Next Frontier Systems | Engineering the Next Generation of Intelligent Systems",
    description: DESCRIPTION,
    locale: "en_US",
    alternateLocale: ["es_ES"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Next Frontier Systems",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

export const viewport = {
  themeColor: "#eef0f2",
  colorScheme: "light",
};

// Stable @id anchors so Organization, Person and WebSite reference each other
// as a single linked graph — this is what lets Google / AI crawlers attribute
// Next Frontier Systems (and its engineering domains) to Jean Claude Morales.
const ORG_ID = `${SITE}/#organization`;
const PERSON_ID = `${SITE}/#jean-claude-morales`;
const WEBSITE_ID = `${SITE}/#website`;

const ENGINEERING_EXPERTISE = [
  "Artificial Intelligence Engineering", "Multi-agent AI Systems", "Scientific Simulation",
  "Digital Twin Engineering", "Telecommunications OSS/BSS", "Large-scale Software Architecture",
  "Medical AI", "Cloud Engineering", "Systems Engineering",
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "TechnologyCompany"],
      "@id": ORG_ID,
      name: "Next Frontier Systems LLC",
      legalName: "Next Frontier Systems LLC",
      url: SITE,
      email: "admin@nextfrontiersystem.com",
      telephone: "+17869844177",
      description: DESCRIPTION,
      slogan: "Engineering the Next Generation of Intelligent Systems",
      foundingDate: "2024",
      founder: { "@id": PERSON_ID },
      employee: { "@id": PERSON_ID },
      address: { "@type": "PostalAddress", addressCountry: "US" },
      areaServed: "Worldwide",
      knowsAbout: ENGINEERING_EXPERTISE.concat(["Quantum Computing", "Aerospace Simulation", "Cybersecurity"]),
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Jean Claude Morales",
      givenName: "Jean Claude",
      familyName: "Morales",
      jobTitle: "Founder, CEO & Engineer",
      description:
        "Jean Claude Morales is an engineer and the founder & CEO of Next Frontier Systems, " +
        "building at the intersection of artificial intelligence, scientific simulation and " +
        "large-scale software engineering. He leads the engineering of foundational technologies " +
        "for healthcare, telecommunications and critical infrastructure.",
      worksFor: { "@id": ORG_ID },
      founder: { "@id": ORG_ID },
      url: SITE,
      image: `${SITE}/founder.jpg`,
      knowsAbout: ENGINEERING_EXPERTISE,
      knowsLanguage: ["en", "es"],
      hasOccupation: {
        "@type": "Occupation",
        name: "Engineer",
        occupationalCategory: "17-2000 Engineers",
        skills: ENGINEERING_EXPERTISE.join(", "),
      },
      // TODO: add real profile URLs (LinkedIn, GitHub, X) here as `sameAs: [...]`
      // once available — strongest single signal for a personal knowledge panel.
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE,
      name: "Next Frontier Systems",
      publisher: { "@id": ORG_ID },
      inLanguage: ["en", "es"],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
