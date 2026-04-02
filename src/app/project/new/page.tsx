import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { NewProjectForm } from "@/components/projects/NewProjectForm";
import { DEMO_MODE } from "@/lib/mock-data";
import Link from "next/link";

export default async function NewProjectPage() {
  if (!DEMO_MODE) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-700 transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">New Project</span>
        </nav>

        <div className="card">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">New Project</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {DEMO_MODE
                    ? "Demo mode — form is interactive but won't save"
                    : "Creates a Drive folder and adds to your project list"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <NewProjectForm demoMode={DEMO_MODE} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
