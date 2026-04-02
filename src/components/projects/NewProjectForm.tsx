"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { JobType, ProjectStatus } from "@/types";

const JOB_TYPES: JobType[] = ["Repair", "Replacement", "Inspection"];
const STATUSES: ProjectStatus[] = ["Active", "In Progress", "Complete"];

const SHINGLE_COLORS = [
  "Charcoal",
  "Weathered Wood",
  "Driftwood",
  "Pewter Gray",
  "Barkwood",
  "Shakewood",
  "Hickory",
  "Estate Gray",
  "Slate",
  "Black",
  "Colonial Slate",
  "Hunter Green",
  "Brownwood",
  "Sand Castle",
  "Other",
];

export function NewProjectForm({ demoMode = false }: { demoMode?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    address: "",
    customer_name: "",
    job_type: "Repair" as JobType,
    shingle_color: "",
    status: "Active" as ProjectStatus,
    notes: "",
  });

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.address.trim() || !form.customer_name.trim()) {
      setError("Address and customer name are required.");
      return;
    }

    setLoading(true);
    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 800));
        // In demo mode, redirect to the first mock project
        router.push("/project/demo-001");
        return;
      }

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      router.push(`/project/${data.project.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <svg
            className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">
        {/* Address */}
        <div>
          <label htmlFor="address" className="label">
            Property Address <span className="text-brand-red">*</span>
          </label>
          <input
            id="address"
            type="text"
            value={form.address}
            onChange={set("address")}
            placeholder="123 Main St, Springfield, IL 62701"
            className="input-field"
            required
          />
        </div>

        {/* Customer name */}
        <div>
          <label htmlFor="customer_name" className="label">
            Customer Name <span className="text-brand-red">*</span>
          </label>
          <input
            id="customer_name"
            type="text"
            value={form.customer_name}
            onChange={set("customer_name")}
            placeholder="John Smith"
            className="input-field"
            required
          />
        </div>

        {/* Job type + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="job_type" className="label">
              Job Type
            </label>
            <select
              id="job_type"
              value={form.job_type}
              onChange={set("job_type")}
              className="input-field"
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="label">
              Initial Status
            </label>
            <select
              id="status"
              value={form.status}
              onChange={set("status")}
              className="input-field"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Shingle color */}
        <div>
          <label htmlFor="shingle_color" className="label">
            Shingle Color
          </label>
          <select
            id="shingle_color"
            value={form.shingle_color}
            onChange={set("shingle_color")}
            className="input-field"
          >
            <option value="">— Select color —</option>
            {SHINGLE_COLORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {form.shingle_color === "Other" && (
            <input
              type="text"
              placeholder="Enter custom color"
              className="input-field mt-2"
              onChange={(e) =>
                setForm((f) => ({ ...f, shingle_color: e.target.value }))
              }
            />
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="label">
            Notes
          </label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={set("notes")}
            placeholder="Job details, special instructions, materials needed..."
            className="input-field resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary flex-1 sm:flex-none justify-center"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary flex-1 sm:flex-none justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Project
            </>
          )}
        </button>
      </div>
    </form>
  );
}
