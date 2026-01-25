import "@/app/assets/styles/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Task and Contact Manager",
  description: "Manage your tasks and contacts efficiently.",
};

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen w-full">{children}</main>
      </body>
    </html>
  );
};

export default AuthLayout;
