import { useState } from 'react';

const DEFAULT_LIMIT = 220;

export function ExpandableText({ text, limit = DEFAULT_LIMIT, className = '' }: { text: string; limit?: number; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > limit;
  const shown = expanded || !isLong ? text : text.slice(0, limit).trimEnd() + '…';
  return <div className={className}>
    <p className="whitespace-pre-line break-words leading-relaxed text-[var(--soft)] [overflow-wrap:anywhere]">{shown}</p>
    {isLong && <button type="button" className="mt-2 text-sm font-semibold text-indigo-600 hover:underline" onClick={() => setExpanded(v => !v)} aria-expanded={expanded}>{expanded ? 'Voir moins' : 'Voir plus'}</button>}
  </div>;
}
