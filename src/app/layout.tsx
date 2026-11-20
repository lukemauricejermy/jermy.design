import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";
import { PreLoader } from "@/components/PreLoader";
import { ThemeProvider } from "@/components/theme-provider";
import { DM_Mono } from "next/font/google";

// Mono face for the overline style and code. preload: false so pages that
// don't use it never download it.
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  preload: false,
});

export const metadata: Metadata = {
  title: "Jermy Design",
  description: "Portfolio of Jermy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={dmMono.variable}>
      <body className="antialiased">
        <PreLoader />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}