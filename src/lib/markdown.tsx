import React from 'react';

/**
 * Lightweight inline markdown renderer.
 * Handles **bold**, *italic*, and `code` — no external dependencies.
 * Returns React nodes, safe to use directly in JSX.
 */
export function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Split on markdown patterns, preserving delimiters
  const parts: React.ReactNode[] = [];
  // Regex: **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Push text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(<strong key={key++} className="font-semibold text-foreground">{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={key++} className="italic">{match[3]}</em>);
    } else if (match[4]) {
      // `code`
      parts.push(<code key={key++} className="rounded bg-white/10 px-1 py-0.5 text-xs font-mono">{match[4]}</code>);
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
