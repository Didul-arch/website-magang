import type React from "react";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";

import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import "./globals.css";
import { AuthContextProvider } from "@/lib/utils/supabase/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Program Magang PT Mada Wikri Tunggal",
  description: "Sistem pendaftaran internship PT Mada Wikri Tunggal",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthContextProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthContextProvider>
        </ThemeProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
