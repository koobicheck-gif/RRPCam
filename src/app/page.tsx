import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectsDashboard } from "@/components/projects/ProjectsDashboard";
import { getAllProjects } from "@/lib/google/sheets";
import { DEMO_MODE, MOCK_PROJECTS } from "@/lib/mock-data";
import Link from "next/link";

export const dynamic = DEMO_MODE ? "auto" : "force-dynamic";
export const revalidate = DEMO_MODE ? false : 0;

export default async function HomePage() {
  let userName = "Demo User";

  if (!DEMO_MODE) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");
    userName = session.user?.name ?? "User";
  }

  let projects = DEMO_MODE
    ? MOCK_PROJECTS
    : await getAllProjects().catch(() => []);

  projects = [...projects].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {userName.split(" ")[0]}
            {DEMO_MODE && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                Demo Mode
              </span>
            )}
          </p>
        </div>
        <Link href="/project/new" className="btn-primary">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New Project</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      <ProjectsDashboard initialProjects={projects} />
    </AppLayout>
  );
}
