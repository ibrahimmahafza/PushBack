import React from 'react';

/**
 * Lightweight inline markdown renderer.
 * Handles **bold**, *italic*, `code`, and stray asterisks.
 * No external dependencies.
 */
export function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  // Order matters: **bold** must match before *italic*
  // Also handle *text:* patterns (colon before closing asterisk)
  const regex = /(\*\*(.+?)\*\*|\*([^*]+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(<strong key={key++} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={key++} className="italic">{match[3]}</em>);
    } else if (match[4]) {
      parts.push(<code key={key++} className="rounded bg-white/10 px-1 py-0.5 text-xs font-mono">{match[4]}</code>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    // Clean up any stray single asterisks that didn't pair
    const remaining = text.slice(lastIndex).replace(/\*/g, '');
    if (remaining) parts.push(remaining);
  }

  return parts.length === 0 ? null : parts.length === 1 ? parts[0] : <>{parts}</>;
}
