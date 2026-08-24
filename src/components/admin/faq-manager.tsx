"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  addFaqAction,
  updateFaqAction,
  deleteFaqAction,
  toggleFaqEnabledAction,
  reorderFaqAction,
  type ActionResult,
} from "@/lib/admin/actions";
import type { AdminFaqItem } from "@/lib/admin/types";

function useAdminAction() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function run(action: () => Promise<ActionResult>, onSuccess?: () => void) {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        if (result.message) toast.success(result.message);
        router.refresh();
        onSuccess?.();
      } else if (result.message) {
        toast.error(result.message);
      }
    });
  }

  return { isPending, run };
}

function EditFaqDialog({ faq }: { faq: AdminFaqItem }) {
  const [open, setOpen] = useState(false);
  const { isPending, run } = useAdminAction();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Edit "${faq.question}"`} />
        }
      >
        <Pencil />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit FAQ</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            run(() => updateFaqAction(formData), () => setOpen(false));
          }}
        >
          <input type="hidden" name="id" value={faq.id} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`q-${faq.id}`}>Question</Label>
            <Input id={`q-${faq.id}`} name="question" defaultValue={faq.question} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`a-${faq.id}`}>Answer</Label>
            <Textarea id={`a-${faq.id}`} name="answer" defaultValue={faq.answer} required className="min-h-24" />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" variant="premium" loading={isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddFaqDialog() {
  const [open, setOpen] = useState(false);
  const { isPending, run } = useAdminAction();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="premium" />}>
        <Plus className="size-4" />
        Add FAQ
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add FAQ</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            run(() => addFaqAction(formData), () => {
              setOpen(false);
              form.reset();
            });
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-q">Question</Label>
            <Input id="new-q" name="question" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-a">Answer</Label>
            <Textarea id="new-a" name="answer" required className="min-h-24" />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" variant="premium" loading={isPending}>
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FaqRow({ faq, index, total }: { faq: AdminFaqItem; index: number; total: number }) {
  const { isPending, run } = useAdminAction();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{faq.question}</p>
        <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Move up"
          disabled={isPending || index === 0}
          onClick={() => run(() => reorderFaqAction(faq.id, "up"))}
        >
          <ChevronUp />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Move down"
          disabled={isPending || index === total - 1}
          onClick={() => run(() => reorderFaqAction(faq.id, "down"))}
        >
          <ChevronDown />
        </Button>
        <Switch
          checked={faq.isEnabled}
          onCheckedChange={(checked) => run(() => toggleFaqEnabledAction(faq.id, checked === true))}
          disabled={isPending}
          aria-label={faq.isEnabled ? "Disable FAQ" : "Enable FAQ"}
        />
        <EditFaqDialog faq={faq} />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Delete FAQ"
          disabled={isPending}
          onClick={() => {
            if (confirm("Delete this FAQ?")) run(() => deleteFaqAction(faq.id));
          }}
        >
          <Trash2 className="text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function FaqManager({ faqs }: { faqs: AdminFaqItem[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AddFaqDialog />
      </div>
      <div className="flex flex-col gap-3">
        {faqs.map((faq, index) => (
          <FaqRow key={faq.id} faq={faq} index={index} total={faqs.length} />
        ))}
        {faqs.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No FAQs yet.</p>
        )}
      </div>
    </div>
  );
}
