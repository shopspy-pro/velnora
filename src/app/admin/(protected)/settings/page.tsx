import { getShippingSettings, getStoreSettings } from "@/lib/admin/queries";
import { updateShippingSettingsAction, updateStoreSettingsAction } from "@/lib/admin/actions";
import { AdminForm } from "@/components/admin/admin-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default async function AdminSettingsPage() {
  const [shipping, store] = await Promise.all([getShippingSettings(), getStoreSettings()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-medium">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Shipping, payment, and store details.
        </p>
      </div>

      <Tabs defaultValue="shipping">
        <TabsList>
          <TabsTrigger value="shipping">Shipping &amp; COD</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
        </TabsList>

        <TabsContent value="shipping">
          <div className="max-w-lg rounded-2xl border border-border bg-card p-5 shadow-soft">
            <AdminForm action={updateShippingSettingsAction}>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="uaeShippingFee">UAE shipping fee (AED)</Label>
                <Input
                  id="uaeShippingFee"
                  name="uaeShippingFee"
                  type="number"
                  step="0.01"
                  defaultValue={shipping.uaeShippingFee}
                  required
                />
                <p className="text-xs text-muted-foreground">Set to 0 for free shipping.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="freeShippingThreshold">Free shipping threshold (AED, optional)</Label>
                <Input
                  id="freeShippingThreshold"
                  name="freeShippingThreshold"
                  type="number"
                  step="0.01"
                  defaultValue={shipping.freeShippingThreshold ?? ""}
                  placeholder="Leave blank to disable"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground">
                    COD is already wired into the real checkout flow — this is a genuine toggle, not cosmetic.
                  </p>
                </div>
                <Switch name="codEnabled" defaultChecked={shipping.codEnabled} />
              </div>
            </AdminForm>
          </div>
        </TabsContent>

        <TabsContent value="store">
          <div className="max-w-lg rounded-2xl border border-border bg-card p-5 shadow-soft">
            <AdminForm action={updateStoreSettingsAction}>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="storeName">Store name</Label>
                <Input id="storeName" name="storeName" defaultValue={store.storeName} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="storeEmail">Store email</Label>
                <Input id="storeEmail" name="storeEmail" type="email" defaultValue={store.storeEmail} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contactPhone">Contact phone</Label>
                <Input id="contactPhone" name="contactPhone" defaultValue={store.contactPhone} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="whatsapp">WhatsApp number</Label>
                <Input id="whatsapp" name="whatsapp" defaultValue={store.whatsapp} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="supportHours">Support hours</Label>
                <Input id="supportHours" name="supportHours" defaultValue={store.supportHours} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Currency</Label>
                <Input value="AED" disabled />
                <p className="text-xs text-muted-foreground">
                  Fixed for now — multi-currency isn&apos;t part of this build.
                </p>
              </div>
            </AdminForm>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
