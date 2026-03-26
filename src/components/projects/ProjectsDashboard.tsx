"use client";

import { useState, useMemo } from "react";
import { Project, ProjectStatus } from "@/types";
import { ProjectCard } from "./ProjectCard";
import { ProjectFilters } from "./ProjectFilters";
import Link from "next/link";

interface ProjectsDashboardProps {
  initialProjects: Project[];
}

export function ProjectsDashboard({ initialProjects }: ProjectsDashboardProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");

  const filtered = useMemo(() => {
    return initialProjects.filter((p) => {
      const matchesSearch =
        !search ||
        p.address.toLowerCase().includes(search.toLowerCase()) ||
        p.customer_name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [initialProjects, search, statusFilter]);

  const stats = useMemo(() => ({
    total: initialProjects.length,
    active: initialProjects.filter((p) => p.status === "Active").length,
    inProgress: initialProjects.filter((p) => p.status === "In Progress").length,
    complete: initialProjects.filter((p) => p.status === "Complete").length,
    totalPhotos: initialProjects.reduce((acc, p) => acc + p.photo_count, 0),
  }), [initialProjects]);

  return (
    <div>
      {/* Stats bar */}
      {initialProjects.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Projects" value={stats.total} color="navy" />
          <StatCard label="Active" value={stats.active} color="green" />
          <StatCard label="In Progress" value={stats.inProgress} color="yellow" />
          <StatCard label="Complete" value={stats.complete} color="blue" />
        </div>
      )}

      {/* Filters */}
      <ProjectFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        count={initialProjects.length}
      />

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState search={search} hasProjects={initialProjects.length > 0} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "navy" | "green" | "yellow" | "blue";
}) {
  const colors = {
    navy: "bg-navy-50 border-navy-100 text-navy-700",
    green: "bg-green-50 border-green-100 text-green-700",
    yellow: "bg-yellow-50 border-yellow-100 text-yellow-700",
    blue: "bg-blue-50 border-blue-100 text-blue-700",
  };

  return (
    <div className={`card p-4 border ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium opacity-70 mt-0.5">{label}</div>
    </div>
  );
}

function EmptyState({
  search,
  hasProjects,
}: {
  search: string;
  hasProjects: boolean;
}) {
  if (search || hasProjects) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-700 mb-1">No projects found</h3>
        <p className="text-sm text-gray-400">
          {search
            ? `No results for "${search}"`
            : "Try a different filter"}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">No projects yet</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
        Create your first project to start documenting roofing jobs with photos and checklists.
      </p>
      <Link href="/project/new" className="btn-primary">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create First Project
      </Link>
    </div>
  );
}
