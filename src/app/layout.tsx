import type {Metadata} from "next";

import {ThemeProvider} from "@/components/theme-provider";
import "./globals.css";
import {SwitchTheme} from "@/components/Switch";
import SignOut from "@/components/SignOut";
import readUserSession from "@/lib/actions";

export const metadata: Metadata = {
  title: "Control de pagos",
  description: "App para controlar los pagos de los socios.",
};

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {data} = await readUserSession();

  return (
    <html lang="en">
      <body>
        <div className="dark container m-auto grid min-h-screen grid-rows-[auto,1fr,auto] content-center bg-background px-4 font-sans antialiased md:px-8">
          <ThemeProvider
            disableTransitionOnChange
            enableSystem
            attribute="class"
            defaultTheme="system"
          >
            <nav className="flex items-center justify-between p-3">
              <header className="text-xl font-bold">Control de pagos</header>
              <div className="flex items-center gap-3">
                {data.session ? <SignOut /> : null}
                <SwitchTheme />
              </div>
            </nav>
            <main className="max-w-full overflow-hidden py-8">{children}</main>
            <footer className="text-center leading-[4rem] opacity-70">
              © {new Date().getFullYear()} Control de pagos.
            </footer>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
