import type {Metadata} from "next";

import {PiggyBank} from "lucide-react";
import Link from "next/link";

import {ThemeProvider} from "@/components/theme-provider";
import "./globals.css";
import {SwitchTheme} from "@/components/Switch";
import SignOut from "@/components/SignOut";
import readUserSession from "@/lib/actions";
import {ReactQueryProvider} from "@/lib/providers/ReactQueryProvider";
import {Button} from "@/components/ui/button";
import {privatePaths} from "@/lib/utils";
import {Toaster} from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Control de pagos",
  description: "App para controlar los pagos de los socios.",
};

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {data} = await readUserSession();

  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <div className="container m-auto grid min-h-screen grid-rows-[auto_1fr_auto] content-center px-4 font-sans antialiased md:px-8">
            <ThemeProvider
              disableTransitionOnChange
              enableSystem
              attribute="class"
              defaultTheme="system"
            >
              <nav className="flex items-center justify-between p-3">
                <header className="text-primary flex items-center gap-1 font-sans text-lg font-bold md:gap-2 md:text-2xl">
                  Control de pagos
                  <PiggyBank size={36} strokeWidth={1.75} />
                </header>
                <div className="flex flex-col items-end justify-between gap-1 md:flex-row-reverse md:items-center md:gap-3">
                  <div className="flex items-center gap-1">
                    {data.session ? <SignOut /> : null}
                    <SwitchTheme />
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={privatePaths.dashboard}>
                      <Button size="sm">Home</Button>
                    </Link>
                    <Link href={privatePaths.createPayment}>
                      <Button size="sm">Agregar pagos</Button>
                    </Link>
                  </div>
                </div>
              </nav>
              <main className="max-w-full overflow-hidden py-8">
                {children}
                <Toaster />
              </main>
              <footer className="text-center leading-16 opacity-70">
                © {new Date().getFullYear()} Control de pagos.
              </footer>
            </ThemeProvider>
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
