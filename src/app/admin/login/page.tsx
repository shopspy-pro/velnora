"use client";

import { useActionState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmbientBackground } from "@/components/motion/ambient-background";
import { FadeIn } from "@/components/motion/fade-in";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-emerald-900 px-4 py-16">
      <AmbientBackground variant="bronze" className="opacity-60" />

      <FadeIn className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-elevated backdrop-blur-xl md:p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-brand-bronze-400/10 ring-1 ring-brand-bronze-400/30">
              <Lock className="size-5 text-brand-bronze-400" strokeWidth={1.5} />
            </span>
            <h1 className="font-heading text-xl font-medium text-brand-sand-50">
              Velnora Admin
            </h1>
            <p className="text-sm text-brand-sand-100/60">
              Sign in to manage your store.
            </p>
          </div>

          <form action={formAction} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-brand-sand-100/80">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                className="border-white/15 bg-white/5 text-brand-sand-50 placeholder:text-brand-sand-100/30"
                placeholder="admin@velnora.ae"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-brand-sand-100/80">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="border-white/15 bg-white/5 text-brand-sand-50 placeholder:text-brand-sand-100/30"
              />
            </div>

            {state.error && (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            )}

            <Button
              type="submit"
              variant="premium"
              size="xl"
              className="mt-2 w-full"
              loading={isPending}
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-brand-sand-100/40">
            <ShieldCheck className="size-3.5" />
            Secured by Supabase Auth.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
