import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-2 text-xl text-gray-600">Page not found</p>
        <p className="mt-1 text-gray-500">
          {"The page you're looking for doesn't exist."}
        </p>
      </div>

      <Link href="/tasks">
        <Button>Back to Tasks</Button>
      </Link>
    </div>
  );
}
