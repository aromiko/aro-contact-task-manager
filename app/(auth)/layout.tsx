import "@/app/assets/styles/globals.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen w-full">{children}</main>
      </body>
    </html>
  );
}
