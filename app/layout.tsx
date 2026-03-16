import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Freedom Club — Own Your Data. Earn Real Money. Get Best Prices.",
  description:
    "Join America's first manufacturer-direct marketplace. Protect your privacy, earn $10+/month watching brand videos, get $20 per referral, and unlock best prices on top consumer brands.",
  keywords: [
    "freedom club",
    "manufacturer direct",
    "consumer privacy",
    "earn money online",
    "referral rewards",
    "anonymous profile",
    "best prices",
  ],
  openGraph: {
    title: "Freedom Club",
    description: "Own your data. Earn real money. Get best prices.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
