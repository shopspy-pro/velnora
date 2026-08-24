import Link from "next/link";
import { XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function CheckoutCancelledPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <XCircle className="size-14 text-muted-foreground" strokeWidth={1.25} />
      <h1 className="font-heading text-2xl font-medium md:text-3xl">
        Checkout cancelled
      </h1>
      <p className="text-muted-foreground">
        No payment was taken. Your bag is still saved whenever you’re ready to
        continue.
      </p>
      <Link href="/checkout" className={buttonVariants({ variant: "premium", size: "lg" })}>
        Return to checkout
      </Link>
    </div>
  );
}
