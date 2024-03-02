import type {Metadata} from "next";

import {ThemeProvider} from "@/components/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Control de pagos",
  description: "App para controlar los pagos de los socios.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="dark container m-auto grid min-h-screen grid-rows-[auto,1fr,auto] content-center bg-background px-4 font-sans antialiased md:px-8">
        <ThemeProvider
          disableTransitionOnChange
          enableSystem
          attribute="class"
          defaultTheme="system"
        >
          <main className="max-w-full overflow-hidden py-8">{children}</main>
          <footer className="text-center leading-[4rem] opacity-70">
            © {new Date().getFullYear()} Control de pagos.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
