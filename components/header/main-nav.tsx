import { User } from "@supabase/supabase-js";

type MainNavProps = {
  user: User | null;
};

const MainNav = ({ user }: MainNavProps) => {
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <span className="font-semibold">Task Manager</span>
      <nav className="flex gap-4 text-sm">
        <a href="/tasks">Tasks</a>
        <a href="/people">People</a>
        <a href="/businesses">Businesses</a>
        <a href="/tags">Tags</a>
        <a href="/categories">Categories</a>
      </nav>

      <div className="flex items-center gap-4">
        <span className="text-sm">
          {user?.user_metadata?.name ?? user?.email}
        </span>

        <form action="/auth/logout" method="post">
          <button className="text-sm underline">Logout</button>
        </form>
      </div>
    </header>
  );
};

export default MainNav;
