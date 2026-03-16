"use client";

import { useEffect, useState } from "react";
import ShareModal from "@/components/ShareModal";

interface Props {
  referralUrl:     string;
  referralCode:    string;
  activeReferrals: number;
}

const STORAGE_KEY      = "fc_banner_dismissed_at";
const REAPPEAR_DAYS    = 7;
const REAPPEAR_MS      = REAPPEAR_DAYS * 24 * 60 * 60 * 1000;

function shouldShow(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const dismissedAt = Number(raw);
    return Date.now() - dismissedAt > REAPPEAR_MS;
  } catch {
    return true;
  }
}

export default function ReferralBanner({ referralUrl, referralCode, activeReferrals }: Props) {
  const [visible,     setVisible]     = useState(false);
  const [showModal,   setShowModal]   = useState(false);

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    setVisible(shouldShow());
  }, []);

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  const earningPotential = (activeReferrals + 1) * 20;

  return (
    <>
      <div className="bg-gradient-to-r from-navy to-blue-accent text-white rounded-2xl px-5 py-4 mb-6 flex items-center gap-4 shadow-md">
        {/* Icon */}
        <div className="shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
          👥
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          {activeReferrals === 0 ? (
            <>
              <p className="font-bold text-sm">
                Refer just 1 friend — cover your entire membership cost!
              </p>
              <p className="text-white/70 text-xs mt-0.5">
                Your referral link is ready. Each friend earns you $20/year, automatically.
              </p>
            </>
          ) : (
            <>
              <p className="font-bold text-sm">
                You have {activeReferrals} active referral{activeReferrals !== 1 ? "s" : ""} —
                earning you ${activeReferrals * 20}/year!
              </p>
              <p className="text-white/70 text-xs mt-0.5">
                One more friend = ${earningPotential}/year. Share your link now.
              </p>
            </>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => setShowModal(true)}
          className="shrink-0 bg-white text-navy px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/90 transition-colors"
        >
          Share My Link
        </button>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={`Dismiss — will reappear in ${REAPPEAR_DAYS} days`}
        >
          ✕
        </button>
      </div>

      {showModal && (
        <ShareModal
          url={referralUrl}
          referralCode={referralCode}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
