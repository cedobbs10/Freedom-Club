"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { trackShareEvent, type SharePlatform } from "@/app/actions/shares";

// ─── Props ─────────────────────────────────────────────────────────────────

interface Props {
  url:          string;
  referralCode: string;
  onClose:      () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildShareLinks(url: string) {
  const tweet = encodeURIComponent(
    `I just joined Freedom Club — earn $1/video, protect your privacy, and get the best prices. Join with my link: ${url} #FreedomClub`
  );
  const emailSub  = encodeURIComponent("You should join Freedom Club");
  const emailBody = encodeURIComponent(
    `Hey!\n\nI've been using Freedom Club and thought you'd love it:\n\n` +
    `• Earn $1 for each brand video you watch (up to $10/month)\n` +
    `• Get $20/year for every friend you refer\n` +
    `• Anonymous profile — your data is NEVER sold\n` +
    `• Manufacturer-direct pricing & rebates\n\n` +
    `Join with my personal link:\n${url}\n\nSee you inside!`
  );
  const smsBody = encodeURIComponent(`Join Freedom Club and earn cash: ${url}`);

  return {
    twitter:  `https://twitter.com/intent/tweet?text=${tweet}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    email:    `mailto:?subject=${emailSub}&body=${emailBody}`,
    sms:      `sms:?body=${smsBody}`,
  };
}

// ─── QR Code canvas ─────────────────────────────────────────────────────────

function QRCanvas({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("qrcode").then((QRCode) => {
      if (cancelled || !canvasRef.current) return;
      QRCode.toCanvas(canvasRef.current, url, {
        width: 180,
        margin: 2,
        color: { dark: "#1B3A5C", light: "#FFFFFF" },
      }).then(() => {
        if (!cancelled) setReady(true);
      });
    });
    return () => { cancelled = true; };
  }, [url]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        className={`rounded-lg transition-opacity ${ready ? "opacity-100" : "opacity-0"}`}
        width={180}
        height={180}
      />
      {!ready && (
        <div className="w-[180px] h-[180px] bg-gray-100 rounded-lg animate-pulse" />
      )}
      <p className="text-xs text-gray-500 text-center">Scan with phone camera</p>
    </div>
  );
}

// ─── Share button ────────────────────────────────────────────────────────────

function ShareBtn({
  icon, label, href, onClick, bgClass,
}: {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  bgClass: string;
}) {
  const cls = `flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-75 ${bgClass}`;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>
        <span className="text-lg w-6 text-center leading-none">{icon}</span>
        {label}
      </a>
    );
  }
  return (
    <button className={cls} onClick={onClick}>
      <span className="text-lg w-6 text-center leading-none">{icon}</span>
      {label}
    </button>
  );
}

// ─── Modal inner ─────────────────────────────────────────────────────────────

function ModalInner({ url, referralCode, onClose }: Props) {
  const [copied, setCopied]     = useState(false);
  const [_pending, startTransition] = useTransition();
  const links = buildShareLinks(url);

  function track(platform: SharePlatform) {
    startTransition(() => trackShareEvent(platform, referralCode));
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    track("copy");
    setTimeout(() => setCopied(false), 2500);
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Share your referral link"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-extrabold text-navy">Share Your Referral Link</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Earn <span className="text-green-600 font-semibold">$20/year</span> for every friend who joins
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* ── Copy link ── */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Your Referral Link
            </p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <span className="flex-1 text-sm text-navy font-mono truncate select-all">
                {url}
              </span>
              <button
                onClick={handleCopy}
                className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-blue-accent text-white hover:bg-blue-dark"
                }`}
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* ── Social share ── */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Share On
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <ShareBtn
                icon="𝕏"
                label="X / Twitter"
                href={links.twitter}
                onClick={() => track("twitter")}
                bgClass="bg-black"
              />
              <ShareBtn
                icon="f"
                label="Facebook"
                href={links.facebook}
                onClick={() => track("facebook")}
                bgClass="bg-[#1877F2]"
              />
              <ShareBtn
                icon="✉"
                label="Email a Friend"
                href={links.email}
                onClick={() => track("email")}
                bgClass="bg-gray-600"
              />
              <ShareBtn
                icon="💬"
                label="SMS / Text"
                href={links.sms}
                onClick={() => track("sms")}
                bgClass="bg-green-600"
              />
            </div>
          </div>

          {/* ── Pre-written tweet preview ── */}
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-sky-700 mb-1">Pre-written tweet</p>
            <p className="text-xs text-sky-900 leading-relaxed">
              &ldquo;I just joined Freedom Club — earn $1/video, protect your privacy, and get the
              best prices. Join with my link: <span className="font-medium">{url}</span> #FreedomClub&rdquo;
            </p>
          </div>

          {/* ── QR code ── */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Share In-Person (QR Code)
            </p>
            <div
              className="flex justify-center"
              onClick={() => track("qr")}
            >
              <QRCanvas url={url} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Portal wrapper (safe for SSR) ───────────────────────────────────────────

export default function ShareModal(props: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(<ModalInner {...props} />, document.body);
}
