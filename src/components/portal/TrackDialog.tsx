import { Check } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { statusStyles, stepIndexFor, timelineSteps, type Complaint } from "./data";

export function TrackDialog({
  complaint,
  onOpenChange,
}: {
  complaint: Complaint | null;
  onOpenChange: (open: boolean) => void;
}) {
  const current = complaint ? stepIndexFor(complaint.status) : 0;

  return (
    <Sheet open={!!complaint} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {complaint ? (
          <>
            <SheetHeader>
              <SheetTitle className="font-display text-xl">{complaint.subject}</SheetTitle>
              <SheetDescription>
                {complaint.id} · {complaint.category} · {complaint.date}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-8">
              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold",
                    statusStyles[complaint.status],
                  )}
                >
                  {complaint.status}
                </span>
                <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  {complaint.urgency} urgency
                </span>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground">
                {complaint.description}
              </p>

              <div>
                <p className="mb-4 text-sm font-bold text-foreground">Status timeline</p>
                <ol className="space-y-0">
                  {timelineSteps.map((step, i) => {
                    const done = i <= current && complaint.status !== "Pending";
                    const isLast = i === timelineSteps.length - 1;
                    return (
                      <li key={step} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span
                            className={cn(
                              "flex size-8 items-center justify-center rounded-full border text-xs font-bold",
                              done
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card text-muted-foreground",
                            )}
                          >
                            {done ? <Check className="size-4" /> : i + 1}
                          </span>
                          {!isLast && (
                            <span
                              className={cn(
                                "w-px flex-1",
                                i < current ? "bg-primary" : "bg-border",
                              )}
                            />
                          )}
                        </div>
                        <div className={cn("pb-6", isLast && "pb-0")}>
                          <p className="text-sm font-semibold text-foreground">{step}</p>
                          <p className="text-xs text-muted-foreground">
                            {done
                              ? "Completed"
                              : i === current + 1
                                ? "Next step"
                                : "Awaiting progress"}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
