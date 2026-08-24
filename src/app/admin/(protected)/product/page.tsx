import Image from "next/image";
import { ImageOff } from "lucide-react";
import { getProduct } from "@/lib/admin/queries";
import { updateProductAction } from "@/lib/admin/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function AdminProductPage() {
  const product = await getProduct();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Product</h1>
        <p className="text-sm text-muted-foreground">
          Flexi Knee Patches — this is your one and only SKU.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <AdminForm action={updateProductAction}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Product name</Label>
              <Input id="name" name="name" defaultValue={product.name} required />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={product.description}
                required
                className="min-h-28"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="basePrice">Base price (AED)</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  step="0.01"
                  defaultValue={product.basePrice}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="stockStatus">Stock status</Label>
                <Select name="stockStatus" defaultValue={product.stockStatus}>
                  <SelectTrigger id="stockStatus" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">In stock</SelectItem>
                    <SelectItem value="low_stock">Low stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Available on storefront</p>
                <p className="text-xs text-muted-foreground">
                  Turn off to hide the product from customers.
                </p>
              </div>
              <Switch name="isAvailable" defaultChecked={product.isAvailable} />
            </div>
          </AdminForm>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-heading text-base font-medium">Images</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Image upload needs Supabase Storage connected — see the final
            report. These are the images currently live on the storefront.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {product.images.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
              >
                {image.url ? (
                  <Image src={image.url} alt={image.alt} fill sizes="140px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ImageOff className="size-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
