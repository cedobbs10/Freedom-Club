import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

/**
 * Refreshes the Supabase session on every request.
 *
 * Must be called from middleware.ts (not a Server Component) because
 * refreshing the session requires both reading and writing cookies,
 * and middleware is the only place in Next.js App Router where both
 * are guaranteed to work on the same request/response cycle.
 *
 * Returns the (possibly modified) NextResponse so middleware.ts can
 * add its own redirect logic before returning to the browser.
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: { id: string; email?: string } | null;
}> {
  // Start with a passthrough response. We mutate its cookies below.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write to the outgoing request (so Server Components can read them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Re-create the response so the updated request headers are included
          response = NextResponse.next({ request });
          // Write to the outgoing response (so the browser stores them)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() validates the JWT and triggers a token refresh if needed.
  // Never use getSession() here — it trusts the cookie without server validation.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
