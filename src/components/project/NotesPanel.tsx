"use client";

import { useState, useEffect } from "react";
import { ProjectComment } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { formatDateRelative } from "@/lib/utils";
import Image from "next/image";

const COMMENTS_KEY = (id: string) => `rrp_comments_${id}`;

interface NotesPanelProps {
  projectId: string;
  initialNotes: string;
  userName: string;
  userImage?: string;
}

export function NotesPanel({
  projectId,
  initialNotes,
  userName,
  userImage,
}: NotesPanelProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COMMENTS_KEY(projectId));
    if (stored) setComments(JSON.parse(stored));
  }, [projectId]);

  useEffect(() => {
    if (comments.length > 0) {
      localStorage.setItem(COMMENTS_KEY(projectId), JSON.stringify(comments));
    }
  }, [comments, projectId]);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const postComment = () => {
    if (!newComment.trim()) return;
    setPosting(true);
    const comment: ProjectComment = {
      id: uuidv4(),
      text: newComment.trim(),
      author: userName,
      author_avatar: userImage,
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [...prev, comment]);
    setNewComment("");
    setPosting(false);
  };

  const deleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Job Notes */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title">Job Notes</h3>
          {(notes !== initialNotes || saving) && (
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="btn-primary py-1.5 text-xs"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Saved
                </>
              ) : (
                "Save Notes"
              )}
            </button>
          )}
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add job notes, material details, special instructions..."
          className="input-field resize-none"
          rows={5}
        />
      </div>

      {/* Comments */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="section-title">Comments</h3>
        </div>

        {/* Comment list */}
        <div className="divide-y divide-gray-50">
          {comments.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-400">No comments yet. Add a note below.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="px-5 py-3.5 flex gap-3 group">
                <div className="shrink-0">
                  {comment.author_avatar ? (
                    <Image
                      src={comment.author_avatar}
                      alt={comment.author}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 text-sm font-bold">
                      {comment.author[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">
                      {comment.author}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDateRelative(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="opacity-0 group-hover:opacity-100 shrink-0 text-gray-300 hover:text-red-400 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add comment */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
          <div className="shrink-0">
            {userImage ? (
              <Image
                src={userImage}
                alt={userName}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 text-sm font-bold">
                {userName[0]}
              </div>
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  postComment();
                }
              }}
              placeholder="Add a comment... (Enter to submit)"
              className="input-field resize-none text-sm flex-1"
              rows={2}
            />
            <button
              onClick={postComment}
              disabled={posting || !newComment.trim()}
              className="btn-navy py-2 text-sm self-end"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
