import { getFaqs } from "@/lib/admin/queries";
import { FaqManager } from "@/components/admin/faq-manager";

export default async function AdminFaqPage() {
  const faqs = await getFaqs();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">FAQ</h1>
        <p className="text-sm text-muted-foreground">
          Add, edit, reorder, or disable questions shown on the storefront.
        </p>
      </div>

      <FaqManager faqs={faqs} />
    </div>
  );
}
