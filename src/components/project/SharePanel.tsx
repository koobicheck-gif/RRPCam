"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SharePanelProps {
  projectId: string;
  address: string;
  onClose: () => void;
  demoMode?: boolean;
}

export function SharePanel({ projectId, address, onClose, demoMode = false }: SharePanelProps) {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState<{
    shareUrl: string;
    driveUrl: string;
  } | null>(null);
  const [copied, setCopied] = useState<"share" | "drive" | null>(null);
  const [error, setError] = useState("");

  const generateLink = async () => {
    setLoading(true);
    setError("");
    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 600));
        const base = typeof window !== "undefined" ? window.location.origin : "";
        setShareData({
          shareUrl: `${base}/RRPCam/share/demo-share-token`,
          driveUrl: "https://drive.google.com/drive/folders/demo-folder-id",
        });
        return;
      }
      const res = await fetch(`/api/projects/${projectId}/share`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate link");
      setShareData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string, type: "share" | "drive") => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-navy-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Share Project</h2>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{address}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {!shareData ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Note:</span> Generating a share link will make this project&#39;s photo folder accessible to anyone with the link.
                </p>
              </div>

              <button
                onClick={generateLink}
                disabled={loading}
                className="btn-primary w-full justify-center"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Generate Share Links
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Share links generated successfully
              </p>

              {/* RRP Gallery Link */}
              <div>
                <label className="label">Customer Gallery Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareData.shareUrl}
                    readOnly
                    className="input-field text-xs flex-1 font-mono"
                  />
                  <button
                    onClick={() => copy(shareData.shareUrl, "share")}
                    className={cn(
                      "shrink-0 px-3 py-2 text-sm font-semibold rounded-lg transition-colors",
                      copied === "share"
                        ? "bg-green-500 text-white"
                        : "bg-navy-50 text-navy-700 hover:bg-navy-100"
                    )}
                  >
                    {copied === "share" ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Google Drive Link */}
              <div>
                <label className="label">Google Drive Folder</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareData.driveUrl}
                    readOnly
                    className="input-field text-xs flex-1 font-mono"
                  />
                  <button
                    onClick={() => copy(shareData.driveUrl, "drive")}
                    className={cn(
                      "shrink-0 px-3 py-2 text-sm font-semibold rounded-lg transition-colors",
                      copied === "drive"
                        ? "bg-green-500 text-white"
                        : "bg-navy-50 text-navy-700 hover:bg-navy-100"
                    )}
                  >
                    {copied === "drive" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <a
                  href={shareData.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-navy-600 hover:underline mt-1 inline-flex items-center gap-1"
                >
                  Open in Google Drive
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-5">
          <button onClick={onClose} className="btn-secondary w-full justify-center">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
