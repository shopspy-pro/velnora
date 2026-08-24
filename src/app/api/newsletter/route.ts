import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import type { NewsletterSubscriberInsert } from "@/lib/supabase/types";

const schema = z.object({
  email: z.email(),
  source: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    const supabase = createServiceClient();
    const payload: NewsletterSubscriberInsert = {
      email: parsed.data.email,
      source: parsed.data.source ?? "footer",
    };
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert(payload);

    // Postgres unique_violation on the email column means they're already
    // subscribed — treat that as success rather than an error.
    if (error && error.code !== "23505") {
      console.error("newsletter insert failed", error);
      return NextResponse.json(
        { error: "Something went wrong. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("newsletter route misconfigured", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
