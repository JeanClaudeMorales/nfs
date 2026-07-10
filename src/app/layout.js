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
  ],
  authors: [{ name: "Jean Claude Morales" }],
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

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Next Frontier Systems LLC",
  legalName: "Next Frontier Systems LLC",
  url: SITE,
  email: "admin@nextfrontiersystem.com",
  telephone: "+17869844177",
  description: DESCRIPTION,
  slogan: "Engineering the Next Generation of Intelligent Systems",
  foundingDate: "2024",
  founder: { "@type": "Person", name: "Jean Claude Morales", jobTitle: "Founder & CEO" },
  address: { "@type": "PostalAddress", addressCountry: "US" },
  areaServed: "Worldwide",
  knowsAbout: [
    "Artificial Intelligence", "Scientific Simulation", "Digital Twins",
    "Telecommunications", "Cloud Engineering", "Medical AI", "Quantum Computing",
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
