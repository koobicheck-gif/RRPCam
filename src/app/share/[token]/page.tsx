import { Suspense } from "react";
import { getProjectById } from "@/lib/google/sheets";
import { getPhotosInFolder } from "@/lib/google/drive";
import { PublicGallery } from "@/components/share/PublicGallery";
import { RRPLogo } from "@/components/brand/RRPLogo";
import {
  DEMO_MODE,
  MOCK_PROJECTS,
  MOCK_PHOTOS,
  MOCK_SHARE_TOKEN,
} from "@/lib/mock-data";
import type { Photo } from "@/types";

export const dynamic = DEMO_MODE ? "auto" : "force-dynamic";

interface SharePageProps {
  params: { token: string };
  searchParams: { pid?: string; fid?: string };
}

export async function generateStaticParams() {
  if (!DEMO_MODE) return [];
  return [{ token: MOCK_SHARE_TOKEN }];
}

export default async function SharePage({ params, searchParams }: SharePageProps) {
  // Demo mode: show the third project (Complete/Inspection — most photos)
  if (DEMO_MODE) {
    if (params.token !== MOCK_SHARE_TOKEN) return <InvalidShare />;
    const project = MOCK_PROJECTS[2]; // Chen Property Group
    const photos = MOCK_PHOTOS[project.id] ?? [];
    return (
      <Suspense fallback={<LoadingGallery />}>
        <PublicGallery project={project} photos={photos} />
      </Suspense>
    );
  }

  const { pid, fid } = searchParams;
  if (!pid || !fid) return <InvalidShare />;

  let project = null;
  let photos: Photo[] = [];

  try {
    project = await getProjectById(pid);
    if (project) photos = await getPhotosInFolder(fid);
  } catch (error) {
    console.error("Share page error:", error);
  }

  if (!project) return <InvalidShare />;

  return (
    <Suspense fallback={<LoadingGallery />}>
      <PublicGallery project={project} photos={photos} />
    </Suspense>
  );
}

function InvalidShare() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <RRPLogo size="md" dark className="justify-center mb-6" />
        <div className="card p-8">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Invalid Share Link</h2>
          <p className="text-sm text-gray-500">
            This link is invalid or the project is no longer available.
          </p>
        </div>
        <p className="text-xs text-gray-400 mt-6">Roof Repair Partners · RRP Field Docs</p>
      </div>
    </div>
  );
}

function LoadingGallery() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-navy-200 border-t-navy-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading gallery...</p>
      </div>
    </div>
  );
}
