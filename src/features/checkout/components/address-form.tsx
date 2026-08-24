"use client";

import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EMIRATES } from "@/lib/constants";
import type { AddressInput } from "@/lib/validations/checkout";

interface AddressFormProps {
  control: Control<AddressInput>;
  register: UseFormRegister<AddressInput>;
  errors: FieldErrors<AddressInput>;
}

export function AddressForm({ control, register, errors }: AddressFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-lg font-medium">Delivery details</h2>

      <Field id="fullName" label="Full name" error={errors.fullName?.message}>
        <Input id="fullName" {...register("fullName")} autoComplete="name" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="phone" label="Phone number" error={errors.phone?.message}>
          <Input
            id="phone"
            {...register("phone")}
            type="tel"
            autoComplete="tel"
            placeholder="+971 5X XXX XXXX"
          />
        </Field>
        <Field id="email" label="Email (optional)" error={errors.email?.message}>
          <Input
            id="email"
            {...register("email")}
            type="email"
            autoComplete="email"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="emirate" label="Emirate" error={errors.emirate?.message}>
          <Controller
            control={control}
            name="emirate"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger id="emirate" aria-label="Emirate" className="w-full">
                  <SelectValue placeholder="Select emirate" />
                </SelectTrigger>
                <SelectContent>
                  {EMIRATES.map((emirate) => (
                    <SelectItem key={emirate} value={emirate}>
                      {emirate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
        <Field id="city" label="City" error={errors.city?.message}>
          <Input id="city" {...register("city")} autoComplete="address-level2" />
        </Field>
      </div>

      <Field id="addressLine1" label="Address" error={errors.addressLine1?.message}>
        <Input
          id="addressLine1"
          {...register("addressLine1")}
          autoComplete="address-line1"
          placeholder="Street, building, apartment"
        />
      </Field>

      <Field id="addressLine2" label="Additional directions (optional)">
        <Input
          id="addressLine2"
          {...register("addressLine2")}
          autoComplete="address-line2"
        />
      </Field>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
