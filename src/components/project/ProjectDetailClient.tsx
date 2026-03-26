"use client";

import { useState, useCallback } from "react";
import { Project, Photo, ProjectStatus } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PhotoGrid } from "./PhotoGrid";
import { UploadPanel } from "./UploadPanel";
import { ChecklistPanel } from "./ChecklistPanel";
import { NotesPanel } from "./NotesPanel";
import { ReportPanel } from "./ReportPanel";
import { SharePanel } from "./SharePanel";
import { formatDate, JOB_TYPE_ICONS } from "@/lib/utils";
import { cn } from "@/lib/utils";

type TabId = "photos" | "checklist" | "notes" | "report";

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  {
    id: "photos",
    label: "Photos",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "checklist",
    label: "Checklist",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "notes",
    label: "Notes",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    id: "report",
    label: "Report",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const STATUSES: ProjectStatus[] = ["Active", "In Progress", "Complete"];

interface ProjectDetailClientProps {
  project: Project;
  initialPhotos: Photo[];
  userName: string;
  userImage?: string;
}

export function ProjectDetailClient({
  project: initialProject,
  initialPhotos,
  userName,
  userImage,
}: ProjectDetailClientProps) {
  const [project, setProject] = useState(initialProject);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [activeTab, setActiveTab] = useState<TabId>("photos");
  const [showUpload, setShowUpload] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleStatusChange = useCallback(
    async (status: ProjectStatus) => {
      setUpdatingStatus(true);
      try {
        const res = await fetch(`/api/projects/${project.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.ok) {
          const data = await res.json();
          setProject(data.project);
        }
      } finally {
        setUpdatingStatus(false);
      }
    },
    [project.id]
  );

  const handlePhotosUploaded = useCallback((newPhotos: Photo[]) => {
    setPhotos((prev) => [...newPhotos, ...prev]);
    setShowUpload(false);
  }, []);

  const handlePhotoDeleted = useCallback((photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }, []);

  return (
    <div className="space-y-5">
      {/* Project Header Card */}
      <div className="card">
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Main info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{JOB_TYPE_ICONS[project.job_type]}</span>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {project.job_type}
                </span>
                <StatusBadge status={project.status} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-1">
                {project.address}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <PersonIcon className="w-3.5 h-3.5" />
                  {project.customer_name}
                </span>
                {project.shingle_color && (
                  <span className="flex items-center gap-1.5">
                    <SwatchIcon className="w-3.5 h-3.5" />
                    {project.shingle_color}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {formatDate(project.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <CameraIcon className="w-3.5 h-3.5" />
                  {photos.length} photos
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {/* Status selector */}
              <div className="relative">
                <select
                  value={project.status}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as ProjectStatus)
                  }
                  disabled={updatingStatus}
                  className="appearance-none pl-3 pr-8 py-2 text-sm font-semibold bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-700 cursor-pointer disabled:opacity-50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  {updatingStatus ? (
                    <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    <ChevronIcon className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowShare(true)}
                className="btn-secondary py-2 text-sm"
              >
                <ShareIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <button
                onClick={() => setShowUpload(true)}
                className="btn-primary py-2 text-sm"
              >
                <UploadIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
              </button>
            </div>
          </div>

          {/* Notes preview */}
          {project.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 line-clamp-2">{project.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 bg-gray-100 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150",
              activeTab === tab.id
                ? "bg-white text-navy-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.id === "photos" && photos.length > 0 && (
              <span
                className={cn(
                  "text-xs rounded-full px-1.5 py-0.5 font-bold tabular-nums",
                  activeTab === "photos"
                    ? "bg-navy-700 text-white"
                    : "bg-gray-300 text-gray-600"
                )}
              >
                {photos.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "photos" && (
          <PhotoGrid
            photos={photos}
            projectId={project.id}
            onDeleted={handlePhotoDeleted}
            onUploadClick={() => setShowUpload(true)}
          />
        )}
        {activeTab === "checklist" && (
          <ChecklistPanel projectId={project.id} photos={photos} />
        )}
        {activeTab === "notes" && (
          <NotesPanel
            projectId={project.id}
            initialNotes={project.notes}
            userName={userName}
            userImage={userImage}
          />
        )}
        {activeTab === "report" && (
          <ReportPanel project={project} photos={photos} />
        )}
      </div>

      {/* Upload modal */}
      {showUpload && (
        <UploadPanel
          projectId={project.id}
          folderId={project.folder_id}
          onUploaded={handlePhotosUploaded}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Share modal */}
      {showShare && (
        <SharePanel
          projectId={project.id}
          address={project.address}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function SwatchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}
