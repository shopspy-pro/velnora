import { getPackages } from "@/lib/admin/queries";
import { updatePackageAction } from "@/lib/admin/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default async function AdminPackagesPage() {
  const packages = await getPackages();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Packages</h1>
        <p className="text-sm text-muted-foreground">
          The three pack sizes shown on the product page.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {packages.map((pkg) => {
          const savings = Math.round((1 - pkg.price / pkg.compareAtPrice) * 100);
          return (
            <div key={pkg.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-heading text-base font-medium">{pkg.name}</h2>
                <span className="rounded-full bg-brand-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-brand-emerald-900">
                  Save {Number.isFinite(savings) ? savings : 0}%
                </span>
              </div>

              <AdminForm action={updatePackageAction} submitLabel="Save">
                <input type="hidden" name="id" value={pkg.id} />

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`name-${pkg.id}`}>Package name</Label>
                  <Input id={`name-${pkg.id}`} name="name" defaultValue={pkg.name} required />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`units-${pkg.id}`}>Quantity (boxes)</Label>
                  <Input
                    id={`units-${pkg.id}`}
                    name="units"
                    type="number"
                    min={1}
                    defaultValue={pkg.units}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`price-${pkg.id}`}>Price (AED)</Label>
                    <Input
                      id={`price-${pkg.id}`}
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={pkg.price}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`compare-${pkg.id}`}>Original price</Label>
                    <Input
                      id={`compare-${pkg.id}`}
                      name="compareAtPrice"
                      type="number"
                      step="0.01"
                      defaultValue={pkg.compareAtPrice}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`badge-${pkg.id}`}>Badge (optional)</Label>
                  <Input
                    id={`badge-${pkg.id}`}
                    name="badge"
                    defaultValue={pkg.badge ?? ""}
                    placeholder="e.g. Most Popular"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">Mark as popular</p>
                  <Switch name="isPopular" defaultChecked={pkg.isPopular} />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <p className="text-sm font-medium">Available</p>
                  <Switch name="isAvailable" defaultChecked={pkg.isAvailable} />
                </div>
              </AdminForm>
            </div>
          );
        })}
      </div>
    </div>
  );
}
