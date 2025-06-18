import type React from "react";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";

import { ThemeProvider } from "@/components/theme-provider";
import Footer from "@/components/footer";
import "./globals.css";
import { AuthContextProvider } from "@/lib/utils/supabase/provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Program Magang PT Mada Wikri Tunggal",
  description: "Sistem pendaftaran internship PT Mada Wikri Tunggal",
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
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
            </div>
          </AuthContextProvider>
        </ThemeProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
