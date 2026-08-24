import { Truck } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="bg-brand-emerald-900 py-2 text-center text-xs font-medium text-brand-sand-50 md:text-sm">
      <p className="mx-auto flex items-center justify-center gap-2 px-4">
        <Truck className="size-3.5 shrink-0 md:size-4" />
        Free shipping across the UAE · Cash on Delivery available
      </p>
    </div>
  );
}
