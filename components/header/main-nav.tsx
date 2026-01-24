import { User } from "@supabase/supabase-js";

type MainNavProps = {
  user: User;
};

const MainNav = ({ user }: MainNavProps) => {
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <h1 className="font-semibold">Task Manager</h1>
      <nav className="flex gap-4 text-sm">
        <a href="/tasks">Tasks</a>
        <a href="/contacts/people">People</a>
        <a href="/contacts/businesses">Businesses</a>
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
