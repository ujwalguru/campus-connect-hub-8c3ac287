import { useEffect, useState } from "react";
import { FileText, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "./data";

export type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
};

export type NewComplaint = {
  subject: string;
  category: string;
  urgency: string;
  description: string;
  anonymous: boolean;
  attachments: Attachment[];
};

const urgencies = ["Low", "Medium", "High", "Critical"];
const MAX_SIZE = 25 * 1024 * 1024;

function prettySize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ComplaintDialog({
  open,
  onOpenChange,
  presetCategory,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  presetCategory?: string | undefined;
  onSubmit: (c: NewComplaint) => void;
}) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(presetCategory ?? "");
  const [urgency, setUrgency] = useState("Medium");
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) setCategory(presetCategory ?? "");
  }, [open, presetCategory]);

  const errors = {
    subject: subject.trim().length < 3 ? "Please write a short title (3+ characters)." : "",
    category: !category ? "Please choose a category." : "",
    description:
      description.trim().length < 6 ? "Please describe the issue (6+ characters)." : "",
  };
  const valid = !errors.subject && !errors.category && !errors.description;

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next: Attachment[] = [];
    for (const file of Array.from(list)) {
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} is larger than 25 MB`);
        continue;
      }
      next.push({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
      });
    }
    if (next.length) setAttachments((prev) => [...prev, ...next]);
  }

  function removeFile(id: string) {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((a) => a.id !== id);
    });
  }

  function handleSubmit() {
    setTouched(true);
    if (!valid) {
      toast.error("Please complete the required fields", {
        description: errors.subject || errors.category || errors.description,
      });
      return;
    }
    onSubmit({ subject, category, urgency, description, anonymous, attachments });
    setSubject("");
    setDescription("");
    setUrgency("Medium");
    setAnonymous(false);
    setAttachments([]);
    setTouched(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Submit a new complaint</DialogTitle>
          <DialogDescription>
            Share the details so the administration can act quickly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Title</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Water cooler not working in Block B"
            />
            {touched && errors.subject && (
              <p className="text-xs font-medium text-destructive">{errors.subject}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched && errors.category && (
                <p className="text-xs font-medium text-destructive">{errors.category}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Urgency</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {urgencies.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, where and when..."
            />
            {touched && errors.description && (
              <p className="text-xs font-medium text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment">Attachments</Label>
            <label
              htmlFor="attachment"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input bg-muted/50 px-4 py-3 text-sm text-muted-foreground hover:border-primary/50"
            >
              <Paperclip className="size-4" />
              Add photos, videos, audio or PDFs (optional, up to 25 MB each)
            </label>
            <input
              id="attachment"
              type="file"
              multiple
              accept="image/*,video/*,audio/*,application/pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />

            {attachments.length > 0 && (
              <ul className="grid gap-3 sm:grid-cols-2">
                {attachments.map((a) => (
                  <li
                    key={a.id}
                    className="relative overflow-hidden rounded-xl border border-border bg-muted/40 p-2"
                  >
                    <button
                      type="button"
                      onClick={() => removeFile(a.id)}
                      aria-label={`Remove ${a.name}`}
                      className="absolute right-2 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow hover:bg-accent"
                    >
                      <X className="size-3.5" />
                    </button>

                    {a.type.startsWith("image/") && (
                      <img
                        src={a.url}
                        alt={a.name}
                        className="h-32 w-full rounded-lg object-cover"
                      />
                    )}
                    {a.type.startsWith("video/") && (
                      <video src={a.url} controls className="h-32 w-full rounded-lg bg-black" />
                    )}
                    {a.type.startsWith("audio/") && (
                      <audio src={a.url} controls className="mt-6 w-full" />
                    )}
                    {a.type === "application/pdf" && (
                      <embed
                        src={a.url}
                        type="application/pdf"
                        className="h-32 w-full rounded-lg bg-background"
                      />
                    )}
                    {!a.type.startsWith("image/") &&
                      !a.type.startsWith("video/") &&
                      !a.type.startsWith("audio/") &&
                      a.type !== "application/pdf" && (
                        <div className="flex h-32 items-center justify-center rounded-lg bg-background">
                          <FileText className="size-8 text-muted-foreground" />
                        </div>
                      )}

                    <p className="mt-2 truncate text-xs font-semibold">{a.name}</p>
                    <p className="text-[11px] text-muted-foreground">{prettySize(a.size)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
            <span>
              <span className="block text-sm font-semibold">Submit anonymously</span>
              <span className="block text-xs text-muted-foreground">
                Your name will be hidden from staff
              </span>
            </span>
            <Switch checked={anonymous} onCheckedChange={setAnonymous} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit complaint</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
