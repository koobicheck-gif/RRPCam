import Link from "next/link";
import { RRPLogo } from "@/components/brand/RRPLogo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <RRPLogo size="md" dark className="justify-center mb-8" />
        <div className="card p-8">
          <div className="text-6xl font-black text-gray-200 mb-4">404</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Page not found</h2>
          <p className="text-gray-500 text-sm mb-6">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link href="/" className="btn-primary justify-center">
            Back to Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
