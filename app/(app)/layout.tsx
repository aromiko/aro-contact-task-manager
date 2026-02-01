import { AppErrorBoundary } from "@/components/errors/app-error-boundary";
import MainNav from "@/components/header/main-nav";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <>
      <MainNav user={user} />
      <AppErrorBoundary>{children}</AppErrorBoundary>
    </>
  );
};

export default AppLayout;
