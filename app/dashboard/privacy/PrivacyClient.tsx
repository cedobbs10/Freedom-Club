"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { deleteAnonymousProfile } from "@/app/actions/privacy";
import type { QueryLogEntry } from "@/app/actions/privacy";

interface Props {
  queryLog:         QueryLogEntry[];
  hasAnonymousData: boolean;
}

// ─── Trust badges ─────────────────────────────────────────────────────────────

const TRUST_BADGES = [
  { icon: "🔐", title: "AES-256 Encryption",      sub: "All data encrypted at rest and in transit" },
  { icon: "🛡️", title: "Zero PII Sharing",        sub: "Personal data never leaves our servers"    },
  { icon: "📊", title: "Aggregate Only",           sub: "Brands see counts, never individuals"      },
  { icon: "🗑️", title: "Right to Delete",          sub: "Remove your anonymous data anytime"        },
  { icon: "🔒", title: "SOC 2 Compliant",          sub: "Third-party security audit (in progress)"  },
  { icon: "⚖️", title: "CCPA / GDPR Ready",        sub: "Full data privacy regulation compliance"   },
];

// ─── How it works steps ───────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    icon: "1️⃣",
    title: "You fill in 7 anonymous fields",
    body: "Age range, income range, sex, marital status, education, zip code, and interests. No name. No email. No address.",
  },
  {
    icon: "2️⃣",
    title: "We store only anonymized ranges",
    body: "We never store your exact age or income — only broad ranges like \"25–34\" or \"$50k–$75k\". Your zip code is stored, but never your street.",
  },
  {
    icon: "3️⃣",
    title: "Manufacturers query the aggregate",
    body: "A brand asks: \"How many active members aged 25–34 in zip 334xx are interested in Technology?\" They receive a single number — like 47. Nothing else.",
  },
  {
    icon: "4️⃣",
    title: "You get paid for relevant ads",
    body: "Because brands can target their ideal audience without buying your data, they pay a premium for video views. You get that premium directly.",
  },
];

// ─── Data comparison table ────────────────────────────────────────────────────

const PRIVATE_DATA = [
  { label: "Full name",           icon: "👤" },
  { label: "Email address",       icon: "✉️" },
  { label: "Payment information", icon: "💳" },
  { label: "Home address",        icon: "🏠" },
  { label: "Phone number",        icon: "📱" },
  { label: "IP address",          icon: "🌐" },
  { label: "Device fingerprint",  icon: "💻" },
  { label: "Browsing history",    icon: "🔍" },
  { label: "Purchase history",    icon: "🛒" },
];

const AGGREGATE_DATA = [
  { label: "Age range",       example: "e.g. 25–34"      },
  { label: "Income range",    example: "e.g. $50k–$75k"  },
  { label: "Sex",             example: "e.g. Male"       },
  { label: "Marital status",  example: "e.g. Married"    },
  { label: "Education level", example: "e.g. Bachelor's" },
  { label: "Zip code",        example: "e.g. 33401"      },
  { label: "Interests",       example: "e.g. Technology" },
];

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteModal({
  onConfirm,
  onCancel,
  pending,
}: {
  onConfirm: () => void;
  onCancel:  () => void;
  pending:   boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="text-center mb-5">
          <div className="text-5xl mb-3">🗑️</div>
          <h3 className="text-xl font-extrabold text-navy">Delete Anonymous Profile?</h3>
          <p className="text-gray-500 text-sm mt-2">
            This will permanently remove your anonymous profile data. You can fill it in again
            at any time, but you will temporarily lose{" "}
            <strong>Priority Member</strong> status and access to higher-paying video ads.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Keep My Data
          </button>
          <Button
            variant="primary"
            className="flex-1 bg-red-600 hover:bg-red-700 focus-visible:ring-red-600"
            onClick={onConfirm}
            loading={pending}
          >
            Yes, Delete It
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function PrivacyClient({ queryLog, hasAnonymousData }: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMsg, setDeleteMsg]             = useState("");
  const [deleted, setDeleted]                 = useState(!hasAnonymousData);
  const [pending, startTransition]            = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAnonymousProfile();
      if ("message" in result) {
        setDeleteMsg(result.message);
      } else {
        setDeleted(true);
        setDeleteMsg("");
      }
      setShowDeleteModal(false);
    });
  }

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div className="bg-gradient-to-r from-navy to-blue-accent rounded-2xl px-6 py-6 text-white">
        <div className="flex items-start gap-4">
          <span className="text-4xl shrink-0">🛡️</span>
          <div>
            <h1 className="text-2xl font-extrabold">Your Data, Your Control</h1>
            <p className="text-white/75 mt-1 text-sm leading-relaxed max-w-2xl">
              Freedom Club is built on a simple principle: your personal identity belongs to you —
              always. Here&apos;s exactly what we know, what we share, and how it protects you while
              putting money back in your pocket.
            </p>
          </div>
        </div>
      </div>

      {/* ── Data comparison ── */}
      <div>
        <h2 className="text-lg font-bold text-navy mb-4">What We Know vs. What We Share</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Private forever */}
          <Card className="border-2 border-red-100">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">✕</span>
                </div>
                <div>
                  <CardTitle className="text-base">Kept Private — Forever</CardTitle>
                  <p className="text-xs text-red-600 font-medium">Encrypted. Never shared. Ever.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {PRIVATE_DATA.map(({ label, icon }) => (
                  <li key={label} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <span>{icon}</span>
                    <span>{label}</span>
                    <span className="ml-auto text-red-400 text-xs">🔒 private</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Shared anonymously */}
          <Card className="border-2 border-green-100">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
                <div>
                  <CardTitle className="text-base">Shared in Aggregate Only</CardTitle>
                  <p className="text-xs text-green-700 font-medium">Brands see counts, never you.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {AGGREGATE_DATA.map(({ label, example }) => (
                  <li key={label} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <span className="text-green-500">✅</span>
                    <span>{label}</span>
                    <span className="ml-auto text-green-600 text-xs">{example}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t border-green-100 bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-800">
                  <strong>Example of what a brand sees:</strong>{" "}
                  &ldquo;47 active members aged 25–34 in zip 334xx interested in Technology.&rdquo;
                  <br />That&apos;s it. No names. No profiles. No individuals.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── How it works ── */}
      <div>
        <h2 className="text-lg font-bold text-navy mb-4">How Your Privacy is Protected</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HOW_IT_WORKS.map(({ icon, title, body }) => (
            <Card key={title} className="bg-gray-50 shadow-none border border-gray-200">
              <CardContent className="pt-5">
                <div className="flex gap-3">
                  <span className="text-2xl shrink-0">{icon}</span>
                  <div>
                    <p className="font-bold text-navy text-sm">{title}</p>
                    <p className="text-gray-600 text-sm mt-1">{body}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Zero-knowledge explainer callout */}
        <Card className="mt-4 bg-blue-50 border-blue-accent/30 shadow-none">
          <CardContent className="pt-5">
            <div className="flex gap-4">
              <span className="text-3xl shrink-0">🧮</span>
              <div>
                <p className="font-bold text-navy">Why aggregation protects you (the math)</p>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  Imagine 500 members share that they are aged 25–34. A brand asks how many fit
                  that profile. They get back &ldquo;500.&rdquo; Even if they query every possible
                  combination of our 7 fields, they still only learn what percentage of a group
                  shares a trait — not which individual is in it. This is the same principle behind{" "}
                  <strong>differential privacy</strong> used by Apple and Google. We apply a minimum
                  threshold: if a query would return fewer than 10 members, we return zero — making
                  it mathematically impossible to identify any individual.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Trust badges ── */}
      <div>
        <h2 className="text-lg font-bold text-navy mb-4">Security & Compliance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TRUST_BADGES.map(({ icon, title, sub }) => (
            <div
              key={title}
              className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl border border-gray-200 bg-white"
            >
              <span className="text-3xl">{icon}</span>
              <p className="font-bold text-navy text-sm">{title}</p>
              <p className="text-gray-500 text-xs">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activity log ── */}
      <div>
        <h2 className="text-lg font-bold text-navy mb-1">Anonymous Profile Activity Log</h2>
        <p className="text-sm text-gray-500 mb-4">
          When a manufacturer query matches your anonymous profile, we log it here so you can
          see your data being used — without ever revealing what was asked.
        </p>
        <Card className="overflow-hidden p-0">
          {queryLog.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <p className="text-3xl mb-2">📋</p>
              <p className="font-medium text-gray-500">No activity yet</p>
              <p className="text-sm mt-1">
                Complete your anonymous profile — brand queries will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Brand</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">What Happened</th>
                  </tr>
                </thead>
                <tbody>
                  {queryLog.map((entry, i) => (
                    <tr key={entry.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(entry.queried_at).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-3 font-medium text-navy">{entry.brand_name}</td>
                      <td className="px-5 py-3 text-gray-500">
                        Your anonymous profile was included in an aggregate query.{" "}
                        <span className="text-green-600 font-medium">No personal data was shared.</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* ── Delete anonymous profile ── */}
      <Card className="border-2 border-red-100">
        <CardHeader>
          <CardTitle className="text-base text-red-700 flex items-center gap-2">
            <span>🗑️</span> Delete My Anonymous Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deleted ? (
            <div className="flex items-center gap-3 text-green-700 bg-green-50 rounded-xl p-4">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold">Anonymous profile deleted.</p>
                <p className="text-sm text-green-600 mt-0.5">
                  Your anonymous data has been removed. You can rebuild your profile at any time in{" "}
                  <a href="/dashboard/profile" className="underline font-medium">My Profile</a>.
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                You can permanently remove your anonymous profile at any time. This immediately stops
                your profile from being included in any future manufacturer queries. Your account,
                earnings, and referrals are not affected.
              </p>
              {deleteMsg && <p className="text-red-500 text-sm mb-3">{deleteMsg}</p>}
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete My Anonymous Profile
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          pending={pending}
        />
      )}
    </div>
  );
}
