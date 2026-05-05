import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";
import { PreLoader } from "@/components/PreLoader";
import { ThemeProvider } from "@/components/theme-provider";

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
    <html lang="en" suppressHydrationWarning>
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