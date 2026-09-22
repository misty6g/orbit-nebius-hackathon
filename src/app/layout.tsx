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
      <body className="font-sans antialiased min-h-[100dvh] bg-[#07080a] text-zinc-100 selection:bg-amber-400 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
