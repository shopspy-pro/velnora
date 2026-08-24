export interface ShippingConfig {
  uaeShippingFee: number;
  freeShippingThreshold: number | null;
  codEnabled: boolean;
}

/** Pure — safe to import from both client and server code. */
export function resolveShippingFee(shipping: ShippingConfig, subtotal: number): number {
  if (
    shipping.freeShippingThreshold !== null &&
    subtotal >= shipping.freeShippingThreshold
  ) {
    return 0;
  }
  return shipping.uaeShippingFee;
}
