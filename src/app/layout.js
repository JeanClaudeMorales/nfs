import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata = {
  title: "Next Frontier Systems | Engineering Complex Ecosystems",
  description: "Diseñamos y construimos la próxima generación de plataformas de ingeniería tecnológica y sistemas complejos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} min-h-full flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}
