import { z } from "zod";
import { EMIRATES } from "@/lib/constants";
import { PRICING_TIERS } from "@/features/product/data/product";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,15}$/, "Please enter a valid phone number."),
  email: z.email().optional().or(z.literal("")),
  emirate: z.enum(EMIRATES, { error: "Please select an emirate." }),
  city: z.string().trim().min(2, "Please enter your city."),
  addressLine1: z.string().trim().min(4, "Please enter your address."),
  addressLine2: z.string().trim().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

const validTierIds = PRICING_TIERS.map((tier) => tier.id);

export const cartLineSchema = z.object({
  tierId: z.enum(validTierIds as [string, ...string[]]),
  quantity: z.number().int().min(1).max(20),
});

export const checkoutRequestSchema = z.object({
  address: addressSchema,
  lines: z.array(cartLineSchema).min(1, "Your bag is empty."),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
