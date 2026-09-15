import { Download, FileText, X } from "lucide-react";
import type { Attachment } from "./data";

export function prettySize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Preview({ a }: { a: Attachment }) {
  if (!a.url) {
    return (
      <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-lg bg-background text-center">
        <FileText className="size-7 text-muted-foreground" />
        <span className="px-2 text-[11px] text-muted-foreground">Preview unavailable</span>
      </div>
    );
  }
  if (a.type.startsWith("image/"))
    return <img src={a.url} alt={a.name} className="h-32 w-full rounded-lg object-cover" />;
  if (a.type.startsWith("video/"))
    return <video src={a.url} controls className="h-32 w-full rounded-lg bg-black" />;
  if (a.type.startsWith("audio/"))
    return (
      <div className="flex h-32 items-center rounded-lg bg-background px-2">
        <audio src={a.url} controls className="w-full" />
      </div>
    );
  if (a.type === "application/pdf")
    return (
      <embed
        src={a.url}
        type="application/pdf"
        className="h-32 w-full rounded-lg bg-background"
      />
    );
  return (
    <div className="flex h-32 items-center justify-center rounded-lg bg-background">
      <FileText className="size-8 text-muted-foreground" />
    </div>
  );
}

export function AttachmentGrid({
  attachments,
  onRemove,
  downloadable = false,
}: {
  attachments: Attachment[];
  onRemove?: (id: string) => void;
  downloadable?: boolean;
}) {
  if (attachments.length === 0) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {attachments.map((a) => (
        <li
          key={a.id}
          className="relative overflow-hidden rounded-xl border border-border bg-muted/40 p-2"
        >
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(a.id)}
              aria-label={`Remove ${a.name}`}
              className="absolute right-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow hover:bg-accent"
            >
              <X className="size-3.5" />
            </button>
          )}
          {downloadable && a.url && (
            <a
              href={a.url}
              download={a.name}
              aria-label={`Download ${a.name}`}
              className="absolute right-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow hover:bg-accent"
            >
              <Download className="size-3.5" />
            </a>
          )}

          <Preview a={a} />

          <p className="mt-2 truncate text-xs font-semibold">{a.name}</p>
          <p className="text-[11px] text-muted-foreground">{prettySize(a.size)}</p>
        </li>
      ))}
    </ul>
  );
}
