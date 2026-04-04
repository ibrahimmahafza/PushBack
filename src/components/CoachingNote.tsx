"use client";

import { renderMarkdown } from "@/lib/markdown";

interface CoachingNoteProps {
  note: string;
}

export default function CoachingNote({ note }: CoachingNoteProps) {
  return (
    <div className="mt-2 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
      <p className="text-xs font-medium text-accent-light mb-1">
        🎯 Coaching Note
      </p>
      <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
        {renderMarkdown(note.trim())}
      </div>
    </div>
  );
}
