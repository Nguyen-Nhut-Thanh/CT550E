import { Fragment, type ReactNode } from "react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";

function safeUrl(url: string) {
  return /^(https?:\/\/|\/(?!\/))[^\s]*$/i.test(url) ? url : undefined;
}
function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g)
    .map((part, index) => {
      if (/^\*\*[^*]+\*\*$/.test(part))
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      if (/^\*[^*]+\*$/.test(part))
        return <em key={index}>{part.slice(1, -1)}</em>;
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link && safeUrl(link[2]))
        return (
          <a
            key={index}
            className="text-sky-600 underline"
            href={safeUrl(link[2])}
            rel="noopener noreferrer"
          >
            {link[1]}
          </a>
        );
      return <Fragment key={index}>{part}</Fragment>;
    });
}

/** Render supported Markdown as React elements; stored HTML is never executed. */
export function BlogBody({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!line.trim()) continue;
    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (image && safeUrl(image[2])) {
      blocks.push(
        <figure key={index}>
          <ImageWithFallback
            src={image[2]}
            alt={image[1]}
            className="max-h-[600px] w-full rounded-2xl object-cover"
          />
          {image[1] && (
            <figcaption className="mt-2 text-center text-sm text-slate-500">
              {image[1]}
            </figcaption>
          )}
        </figure>,
      );
    } else if (heading) {
      blocks.push(
        heading[1].length < 3 ? (
          <h2 key={index} className="pt-4 text-2xl font-bold text-slate-900">
            {inline(heading[2])}
          </h2>
        ) : (
          <h3 key={index} className="pt-2 text-xl font-bold text-slate-900">
            {inline(heading[2])}
          </h3>
        ),
      );
    } else if (/^[-*]\s/.test(line) || /^\d+\.\s/.test(line)) {
      const ordered = /^\d+\.\s/.test(line);
      const items: ReactNode[] = [];
      const start = index;
      const pattern = ordered ? /^\d+\.\s/ : /^[-*]\s/;
      while (index < lines.length && pattern.test(lines[index])) {
        items.push(
          <li key={index}>{inline(lines[index].replace(pattern, ""))}</li>,
        );
        index++;
      }
      index--;
      blocks.push(
        ordered ? (
          <ol key={start} className="list-decimal space-y-2 pl-6">
            {items}
          </ol>
        ) : (
          <ul key={start} className="list-disc space-y-2 pl-6">
            {items}
          </ul>
        ),
      );
    } else if (line.startsWith("> ")) {
      blocks.push(
        <blockquote
          key={index}
          className="border-l-4 border-sky-400 bg-sky-50 p-4 italic"
        >
          {inline(line.slice(2))}
        </blockquote>,
      );
    } else {
      const paragraph = [line];
      const start = index;
      while (
        index + 1 < lines.length &&
        lines[index + 1].trim() &&
        !/^(#{1,3}\s|!\[|[-*]\s|\d+\.\s|> )/.test(lines[index + 1])
      )
        paragraph.push(lines[++index]);
      blocks.push(
        <p key={start} className="whitespace-pre-line">
          {inline(paragraph.join("\n"))}
        </p>,
      );
    }
  }
  return (
    <div className="space-y-5 break-words text-base leading-8 text-slate-700">
      {blocks}
    </div>
  );
}
