import React from 'react';

/**
 * Lightweight inline markdown renderer.
 * Handles **bold**, *italic*, `code`, bullet lists (- or •), and stray asterisks.
 * No external dependencies.
 */

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
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
    const remaining = text.slice(lastIndex).replace(/\*/g, '');
    if (remaining) parts.push(remaining);
  }

  return parts.length === 0 ? null : parts.length === 1 ? parts[0] : <>{parts}</>;
}

export function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Check if text contains bullet points (lines starting with - or •)
  const lines = text.split('\n');
  const hasBullets = lines.some(l => /^\s*[-•]\s/.test(l));

  if (!hasBullets) {
    return renderInline(text);
  }

  // Parse into paragraphs and bullet lists
  const elements: React.ReactNode[] = [];
  let currentBullets: string[] = [];
  let currentParagraph: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const joined = currentParagraph.join(' ').trim();
      if (joined) {
        elements.push(<span key={key++}>{renderInline(joined)}</span>);
      }
      currentParagraph = [];
    }
  };

  const flushBullets = () => {
    if (currentBullets.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-outside pl-5 space-y-1.5 my-2">
          {currentBullets.map((b, i) => (
            <li key={i} className="leading-relaxed">{renderInline(b)}</li>
          ))}
        </ul>
      );
      currentBullets = [];
    }
  };

  for (const line of lines) {
    const bulletMatch = line.match(/^\s*[-•]\s+(.+)/);
    if (bulletMatch) {
      flushParagraph();
      currentBullets.push(bulletMatch[1]);
    } else {
      flushBullets();
      if (line.trim()) {
        currentParagraph.push(line.trim());
      }
    }
  }

  flushParagraph();
  flushBullets();

  return elements.length === 1 ? elements[0] : <>{elements}</>;
}
