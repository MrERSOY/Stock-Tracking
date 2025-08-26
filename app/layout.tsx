import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ActiveThemeProvider } from "@/components/active-theme";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auth Demo",
  description: "A Next.js authentication demo application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          src="https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js"
          async
        ></script>
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ActiveThemeProvider>{children}</ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
