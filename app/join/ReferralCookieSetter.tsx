"use client";

import { useEffect } from "react";

/**
 * Sets a referral code cookie on mount so it survives navigation.
 * If the user browses away and comes back later to sign up, the
 * signup flow can still read their referrer from the cookie.
 *
 * Cookie is scoped to the site root, expires in 30 days, and is
 * HttpOnly=false so the signup form can read it client-side if needed.
 */
export default function ReferralCookieSetter({ code }: { code: string }) {
  useEffect(() => {
    if (!code) return;
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `fc_ref=${code}; path=/; expires=${expires}; SameSite=Lax`;
  }, [code]);

  return null;
}
