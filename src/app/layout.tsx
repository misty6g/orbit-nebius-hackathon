import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit | Sovereign Personal Student OS",
  description:
    "A sovereign personal student OS powered by NVIDIA Nemotron on Nebius Token Factory with a 3D planetary cosmos interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased min-h-[100dvh] bg-space-950 text-white selection:bg-amber-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
