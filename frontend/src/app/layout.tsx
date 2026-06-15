import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthHydration } from "@/components/providers/auth-hydration";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Harshith Ram Construction | Construction Management Platform",
  description: "Enterprise construction ERP for project management, materials, workforce, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthHydration>
            <ToastProvider>
              {children}
              <Toaster />
            </ToastProvider>
          </AuthHydration>
        </ThemeProvider>
      </body>
    </html>
  );
}
