"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { User } from "@supabase/supabase-js";
import { Menu, PowerOff } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MainNavProps = {
  user: User | null;
};

const navItems = [
  { href: "/tasks", label: "Tasks" },
  { href: "/people", label: "People" },
  { href: "/businesses", label: "Businesses" },
  { href: "/tags", label: "Tags" },
  { href: "/categories", label: "Categories" },
];

const MainNav = ({ user }: MainNavProps) => {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b px-4 py-3 md:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-64 p-4 pt-3">
            <div className="mb-6 text-lg font-semibold">Aro Task Manager</div>

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href);

                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-md px-3 py-2 text-sm transition ${
                        active ? "bg-muted font-medium" : "hover:bg-muted/60"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>

            <Separator className="my-6 mt-auto" />

            <form action="/auth/logout" method="post">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                type="submit"
              >
                <PowerOff className="h-4 w-4" />
                Logout
              </Button>
            </form>
          </SheetContent>
        </Sheet>

        <span className="text-sm font-semibold md:text-base">
          Aro Task Manager
        </span>

        {/* Desktop nav */}
        <nav className="ml-6 hidden gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm transition ${
                  active ? "bg-muted font-medium" : "hover:bg-muted/60"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <Avatar className="h-7 w-7">
          <AvatarFallback>
            {(user?.user_metadata?.name ?? user?.email ?? "?")
              .charAt(0)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <span className="hidden text-sm md:inline">
          {user?.user_metadata?.name ?? user?.email}
        </span>

        <form action="/auth/logout" method="post" className="hidden md:block">
          <Button size="icon" variant="outline" type="submit">
            <PowerOff className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
};

export default MainNav;
