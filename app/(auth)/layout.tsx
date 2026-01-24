import "@/app/assets/styles/globals.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center">
        {children}
      </body>
    </html>
  );
}
