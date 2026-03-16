import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function generateReferralCode(userId: string): string {
  // Take first 8 chars of userId and uppercase
  return userId.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function getReferralUrl(referralCode: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://freedomclub.com";
  return `${baseUrl}/signup?ref=${referralCode}`;
}
