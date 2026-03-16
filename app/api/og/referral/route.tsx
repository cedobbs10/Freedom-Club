import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Satori/ImageResponse renders JSX to PNG — styles must be inline, no Tailwind.
// Font sizes, colors, and layout are all set via style props.

const NAVY        = "#1B3A5C";
const BLUE_ACCENT = "#2E75B6";
const WHITE       = "#FFFFFF";
const GREEN       = "#16a34a";
const GRAY_LIGHT  = "#F1F5F9";
const GRAY_MED    = "#94A3B8";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref")?.trim().toUpperCase() ?? "";

  // ── Look up referrer first name ──────────────────────────────────────────
  let firstName = "A Friend";
  if (ref) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("profiles")
        .select("full_name")
        .eq("referral_code", ref)
        .maybeSingle();

      if (data?.full_name) {
        firstName = data.full_name.trim().split(/\s+/)[0];
      }
    } catch {
      // Non-fatal — fall back to "A Friend"
    }
  }

  // ── Image ────────────────────────────────────────────────────────────────
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: NAVY,
          padding: "60px 72px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top: Logo + badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: BLUE_ACCENT,
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: WHITE, fontWeight: 800, fontSize: "20px" }}>FC</span>
            </div>
            <span style={{ color: WHITE, fontWeight: 800, fontSize: "28px", letterSpacing: "-0.5px" }}>
              Freedom Club
            </span>
          </div>
          {/* Invite badge */}
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: "100px",
              padding: "10px 24px",
              display: "flex",
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "18px", fontWeight: 600 }}>
              Personal Invitation
            </span>
          </div>
        </div>

        {/* Main headline */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "48px", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
            <span
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: "28px",
                fontWeight: 500,
                lineHeight: 1.3,
              }}
            >
              {firstName} personally invited you to
            </span>
          </div>
          <div style={{ display: "flex", marginTop: "8px" }}>
            <span
              style={{
                color: WHITE,
                fontSize: "64px",
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: "-2px",
              }}
            >
              Freedom Club
            </span>
          </div>

          {/* Value props row */}
          <div style={{ display: "flex", gap: "20px", marginTop: "44px" }}>
            {[
              { icon: "🎬", title: "$1/video",        sub: "Up to $10/month" },
              { icon: "👥", title: "$20/year",         sub: "Per friend referred" },
              { icon: "🔒", title: "Private profile",  sub: "Zero PII sold" },
            ].map(({ icon, title, sub }) => (
              <div
                key={title}
                style={{
                  flex: 1,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span style={{ fontSize: "28px" }}>{icon}</span>
                <span style={{ color: WHITE, fontSize: "22px", fontWeight: 800 }}>{title}</span>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "15px" }}>{sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "40px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "16px" }}>
            freedomclub.com
          </span>
          <div
            style={{
              backgroundColor: GREEN,
              borderRadius: "10px",
              padding: "12px 28px",
              display: "flex",
            }}
          >
            <span style={{ color: WHITE, fontWeight: 800, fontSize: "18px" }}>
              Join Now — $10/month
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width:  1200,
      height: 630,
    }
  );
}
