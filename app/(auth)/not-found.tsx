import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <p className="mt-2 text-xl text-gray-600">Page not found</p>
        <p className="mt-1 text-gray-500">
          The auth page you're looking for doesn't exist.
        </p>
      </div>

      <Link href="/login">
        <Button>Go to Login</Button>
      </Link>
    </div>
  );
}
