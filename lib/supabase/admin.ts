import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Admin Supabase client using the service role key.
 *
 * IMPORTANT:
 * - Only import this in server-side code (Route Handlers, Server Actions).
 * - NEVER import this in Client Components or expose it to the browser.
 * - The service role key bypasses Row Level Security entirely.
 *
 * Use cases:
 * - Stripe webhook handler writing subscription updates
 * - Crediting earnings after a confirmed video view
 * - Marking referrals as active after payment confirmation
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        // Disable auto-refresh and session persistence for server-side admin use.
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
