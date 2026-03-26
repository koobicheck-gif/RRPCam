import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { getProjectById } from "@/lib/google/sheets";
import { getPhotosInFolder } from "@/lib/google/drive";
import { ProjectDetailClient } from "@/components/project/ProjectDetailClient";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProjectPageProps {
  params: { id: string };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const project = await getProjectById(params.id);
  if (!project) notFound();

  let photos: Awaited<ReturnType<typeof getPhotosInFolder>> = [];
  try {
    photos = await getPhotosInFolder(project.folder_id);
  } catch (error) {
    console.error("Failed to load photos:", error);
  }

  return (
    <AppLayout>
      {/* Breadcrumb */}
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
        userName={session.user?.name || "User"}
        userImage={session.user?.image || undefined}
      />
    </AppLayout>
  );
}
