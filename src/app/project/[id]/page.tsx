import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { getProjectById } from "@/lib/google/sheets";
import { getPhotosInFolder } from "@/lib/google/drive";
import { ProjectDetailClient } from "@/components/project/ProjectDetailClient";
import {
  DEMO_MODE,
  MOCK_PROJECTS,
  MOCK_PHOTOS,
} from "@/lib/mock-data";
import Link from "next/link";

export const dynamic = DEMO_MODE ? "auto" : "force-dynamic";
export const revalidate = DEMO_MODE ? false : 0;

interface ProjectPageProps {
  params: { id: string };
}

// Required for static export — tells Next.js which [id] values to pre-render
export async function generateStaticParams() {
  if (!DEMO_MODE) return [];
  return MOCK_PROJECTS.map((p) => ({ id: p.id }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  let userName = "Demo User";
  let userImage: string | undefined;

  if (!DEMO_MODE) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");
    userName = session.user?.name ?? "User";
    userImage = session.user?.image ?? undefined;
  }

  const project = DEMO_MODE
    ? MOCK_PROJECTS.find((p) => p.id === params.id) ?? null
    : await getProjectById(params.id);

  if (!project) notFound();

  const photos = DEMO_MODE
    ? (MOCK_PHOTOS[params.id] ?? [])
    : await getPhotosInFolder(project.folder_id).catch(() => []);

  return (
    <AppLayout>
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link href="/" className="hover:text-gray-700 transition-colors">
          Projects
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">
          {project.address}
        </span>
      </nav>

      <ProjectDetailClient
        project={project}
        initialPhotos={photos}
        userName={userName}
        userImage={userImage}
        demoMode={DEMO_MODE}
      />
    </AppLayout>
  );
}
