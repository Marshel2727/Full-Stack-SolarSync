import React, { ReactNode } from 'react';

// Safe Markdown subset: HTML stays escaped and links only use HTTP(S).
function inline(text: string): ReactNode[] {
  const pattern = /(\[[^\]\n]+\]\([^\s)]+\)|\*\*[^*\n]+\*\*|`[^`\n]+`|\*[^*\n]+\*|https?:\/\/[^\s<>]+)/g;
  return text.split(pattern).filter(Boolean).map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link || /^https?:\/\//.test(part)) {
      const href = link ? link[2] : part;
      if (!/^https?:\/\//i.test(href)) return <React.Fragment key={i}>{part}</React.Fragment>;
      return <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="break-words font-medium text-primary underline underline-offset-4">{link ? link[1] : part}</a>;
    }
    if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`')) return <code key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">{part.slice(1, -1)}</code>;
    if (part.startsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function ArticleContent({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      blocks.push(React.createElement(`h${Math.max(2, heading[1].length)}`, { key: i, className: 'pt-3 text-xl font-bold text-slate-900' }, inline(heading[2])));
      i++; continue;
    }
    if (/^```/.test(line)) {
      const key = i++;
      const code: string[] = [];
      while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
      i++;
      blocks.push(<pre key={key} className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-white"><code>{code.join('\n')}</code></pre>);
      continue;
    }
    const list = line.match(/^\s*(?:([-*])|(\d+)\.)\s+(.+)$/);
    if (list) {
      const ordered = !!list[2];
      const key = i;
      const items: ReactNode[] = [];
      while (i < lines.length) {
        const entry = lines[i].match(ordered ? /^\s*\d+\.\s+(.+)$/ : /^\s*[-*]\s+(.+)$/);
        if (!entry) break;
        items.push(<li key={i++}>{inline(entry[1])}</li>);
      }
      blocks.push(ordered ? <ol key={key} className="list-decimal space-y-2 pl-6">{items}</ol> : <ul key={key} className="list-disc space-y-2 pl-6">{items}</ul>);
      continue;
    }
    const key = i;
    const paragraph = [lines[i++]];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|\s*[-*]\s|\s*\d+\.\s)/.test(lines[i])) paragraph.push(lines[i++]);
    blocks.push(<p key={key} className="whitespace-pre-line">{inline(paragraph.join('\n'))}</p>);
  }
  return <div className="space-y-5 break-words text-sm leading-loose sm:text-base">{blocks}</div>;
}
