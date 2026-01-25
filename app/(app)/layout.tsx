import "@/app/assets/styles/globals.css";
import MainNav from "@/components/header/main-nav";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

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

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MainNav user={user} />
        <main className="min-h-screen w-full">{children}</main>
      </body>
    </html>
  );
};

export default RootLayout;
