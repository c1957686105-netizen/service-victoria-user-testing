import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Service Victoria · Design Research", description: "A guided, moderated usability study for Start with My Task.", icons: { icon: "/favicon.svg" } };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
