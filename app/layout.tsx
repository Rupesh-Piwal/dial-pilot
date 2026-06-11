import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Dial Pilot — AI-Powered Voice Agent",
  description:
    "Deploy intelligent AI voice agents that make phone calls on your behalf. Configure, dispatch, and monitor calls in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${schibsted.variable} antialiased`}>
      <body className={schibsted.className}>{children}</body>
    </html>
  );
}
