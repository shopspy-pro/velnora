"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteMediaAssetAction,
  reorderMediaAssetAction,
  updateMediaAssetAction,
  uploadMediaAssetAction,
} from "@/lib/admin/actions";
import type { AdminMediaAsset, MediaSection } from "@/lib/admin/types";

export function MediaSectionManager({
  section,
  title,
  description,
  assets,
}: {
  section: MediaSection;
  title: string;
  description: string;
  assets: AdminMediaAsset[];
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [altDraft, setAltDraft] = useState("");

  function run(action: () => Promise<{ success: boolean; message?: string }>, onSuccess?: () => void) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        if (result.message) toast.success(result.message);
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(result.message ?? "Something went wrong.");
      }
    });
  }

  function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (!(formData.get("file") as File)?.size) {
      toast.error("Please choose an image first.");
      return;
    }
    run(() => uploadMediaAssetAction(formData), () => {
      event.currentTarget.reset();
      setAltDraft("");
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <h2 className="font-heading text-base font-medium">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset, index) => (
          <div key={asset.id} className="flex flex-col gap-2 rounded-xl border border-border p-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
              <Image src={asset.url} alt={asset.alt} fill sizes="200px" className="object-cover" />
            </div>
            <form
              className="flex items-center gap-1.5"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                run(() => updateMediaAssetAction(fd));
              }}
            >
              <input type="hidden" name="id" value={asset.id} />
              <Input
                name="alt"
                defaultValue={asset.alt}
                placeholder="Alt text"
                className="h-8 text-xs"
                disabled={isPending}
              />
              <Button type="submit" size="sm" variant="outline" disabled={isPending}>
                Save
              </Button>
            </form>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Move up"
                  disabled={isPending || index === 0}
                  onClick={() => run(() => reorderMediaAssetAction(asset.id, "up"))}
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Move down"
                  disabled={isPending || index === assets.length - 1}
                  onClick={() => run(() => reorderMediaAssetAction(asset.id, "down"))}
                >
                  <ArrowDown />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete image"
                disabled={isPending}
                onClick={() => {
                  if (confirm("Delete this image?")) {
                    run(() => deleteMediaAssetAction(asset.id));
                  }
                }}
              >
                <Trash2 className="text-destructive" />
              </Button>
            </div>
          </div>
        ))}

        <form
          onSubmit={handleUpload}
          className="flex flex-col justify-between gap-2 rounded-xl border border-dashed border-border p-3"
        >
          <input type="hidden" name="section" value={section} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`file-${section}`} className="text-xs">
              New image
            </Label>
            <input
              id={`file-${section}`}
              ref={fileInputRef}
              name="file"
              type="file"
              accept="image/*"
              disabled={isPending}
              className="text-xs file:mr-2 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
            />
          </div>
          <Input
            name="alt"
            placeholder="Alt text (describes the image)"
            className="h-8 text-xs"
            value={altDraft}
            onChange={(e) => setAltDraft(e.target.value)}
            disabled={isPending}
          />
          <Button type="submit" size="sm" variant="premium" loading={isPending}>
            <ImagePlus className="size-4" />
            Upload
          </Button>
        </form>
      </div>
    </div>
  );
}
