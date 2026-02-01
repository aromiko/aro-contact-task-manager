import "@/app/assets/styles/globals.css";
import { AppErrorBoundary } from "@/components/errors/app-error-boundary";
import MainNav from "@/components/header/main-nav";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { redirect } from "next/navigation";

export const revalidate = 3600;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aro | Task and Contact Manager",
  description: "Manage your tasks and contacts efficiently.",
};

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MainNav user={user} />
        <AppErrorBoundary>{children}</AppErrorBoundary>
      </body>
    </html>
  );
};

export default RootLayout;
