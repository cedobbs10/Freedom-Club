"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ShareModal from "@/components/ShareModal";
import type { ReferralStats, ReferralRecord, LeaderboardPosition, MonthlyEarning } from "@/app/actions/referrals";

// ─── Props ─────────────────────────────────────────────────────────────────

interface Props {
  stats:       ReferralStats;
  referrals:   ReferralRecord[];
  leaderboard: LeaderboardPosition | null;
  chart:       MonthlyEarning[];
}

// ─── Sub-components ────────────────────────────────────────────────────────

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 px-4 py-2 bg-blue-accent hover:bg-blue-dark text-white text-sm font-semibold rounded-lg transition-colors"
    >
      {copied ? "✓ Copied!" : "Copy Link"}
    </button>
  );
}


function StatCard({
  label,
  value,
  sub,
  color = "text-navy",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="mb-1">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
        {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function LeaderboardBadge({ pos }: { pos: LeaderboardPosition }) {
  const pct = pos.percentile;
  const tier =
    pct >= 90 ? { label: "Top Performer", color: "bg-yellow-400 text-yellow-900", icon: "🏆" }
    : pct >= 70 ? { label: "Rising Star",   color: "bg-blue-accent text-white",     icon: "⭐" }
    : { label: "Growing",     color: "bg-gray-200 text-gray-700",   icon: "🌱" };

  return (
    <Card className="bg-gradient-to-r from-navy to-blue-accent text-white">
      <CardContent className="py-4 flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm">Leaderboard Position</p>
          <p className="text-2xl font-extrabold mt-0.5">
            You&apos;re in the top <span className="text-yellow-300">{pct}%</span> of referrers!
          </p>
          <p className="text-white/70 text-sm mt-1">
            Rank #{pos.rank} out of {pos.totalReferrers} members who refer •{" "}
            {pos.activeReferrals} active referral{pos.activeReferrals !== 1 ? "s" : ""}
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${tier.color}`}>
          {tier.icon} {tier.label}
        </div>
      </CardContent>
    </Card>
  );
}

function ReferralsTable({ referrals }: { referrals: ReferralRecord[] }) {
  if (!referrals.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-semibold text-navy text-lg">No referrals yet</p>
          <p className="text-gray-500 mt-1 text-sm">Share your link above to start earning $20/year per friend!</p>
        </CardContent>
      </Card>
    );
  }

  const statusStyles: Record<string, string> = {
    active:  "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    expired: "bg-gray-100 text-gray-500",
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Date Joined</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Member</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-right px-5 py-3 font-semibold text-gray-600">Fee Earned</th>
              <th className="text-right px-5 py-3 font-semibold text-gray-600">Next Fee In</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((r, i) => (
              <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className="px-5 py-3 text-gray-600">
                  {new Date(r.joinedAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                  })}
                </td>
                <td className="px-5 py-3 font-medium text-navy">{r.referredName}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[r.status]}`}>
                    {r.statusLabel}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-semibold text-green-700">
                  ${r.feeEarned.toFixed(2)}
                </td>
                <td className="px-5 py-3 text-right text-gray-500">
                  {r.nextPayoutMonths !== null
                    ? r.nextPayoutMonths === 0
                      ? <span className="text-green-600 font-semibold">Due now!</span>
                      : `${r.nextPayoutMonths} mo`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function EarningsChart({ data }: { data: MonthlyEarning[] }) {
  const max = Math.max(...data.map((d) => d.amount), 20);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Referral Earnings</CardTitle>
        <p className="text-sm text-gray-500 mt-0.5">Last 12 months</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1.5 h-32">
          {data.map((d) => {
            const heightPct = max > 0 ? (d.amount / max) * 100 : 0;
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group">
                {/* Tooltip */}
                <div className="relative">
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-navy text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none transition-opacity z-10">
                    ${d.amount.toFixed(2)}
                  </div>
                  <div
                    className={`w-full rounded-t-sm min-h-[2px] transition-all ${
                      d.amount > 0 ? "bg-green-500" : "bg-gray-200"
                    }`}
                    style={{ height: `${Math.max(2, (heightPct / 100) * 112)}px` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{d.monthLabel}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Total (12 mo):{" "}
            <span className="font-bold text-green-700">
              ${data.reduce((s, d) => s + d.amount, 0).toFixed(2)}
            </span>
          </span>
          <span className="text-gray-400 text-xs">Hover bars to see monthly total</span>
        </div>
      </CardContent>
    </Card>
  );
}

function TipsSection({ activeReferrals, feePerReferral }: { activeReferrals: number; feePerReferral: number }) {
  const nextMilestone = activeReferrals < 1 ? 1 : activeReferrals < 5 ? 5 : activeReferrals < 10 ? 10 : 25;
  const earnAtMilestone = nextMilestone * feePerReferral;

  const tips = [
    {
      icon: "📱",
      title: "Share on social media",
      body: "Post your referral link on X, Facebook, or Instagram. A single post can reach hundreds of people who may be interested in earning extra cash.",
    },
    {
      icon: "💬",
      title: "Text it directly",
      body: "Personal recommendations convert 5× better than cold posts. Text 3 friends right now with a personal note — it takes 60 seconds.",
    },
    {
      icon: "📧",
      title: "Add it to your email signature",
      body: `Drop your link in your email signature with a one-line pitch. Every email you send becomes a passive referral opportunity.`,
    },
    {
      icon: "🔄",
      title: "Remind past referrals",
      body: "If someone clicked your link but didn't join, follow up once. Life gets busy — a friendly reminder often closes the deal.",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>How to Maximize Your Referrals</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Milestone motivator */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="font-semibold text-green-800">
              Reach {nextMilestone} active referral{nextMilestone !== 1 ? "s" : ""} →{" "}
              earn <span className="text-green-600">${earnAtMilestone}/year</span> passively!
            </p>
            <p className="text-green-700 text-sm mt-0.5">
              {activeReferrals === 0
                ? "Refer just 1 friend and cover your entire membership cost — every year."
                : `You're at ${activeReferrals} — just ${nextMilestone - activeReferrals} more to hit the next milestone.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tips.map(({ icon, title, body }) => (
            <div key={title} className="flex gap-3">
              <span className="text-2xl shrink-0">{icon}</span>
              <div>
                <p className="font-semibold text-navy text-sm">{title}</p>
                <p className="text-gray-500 text-sm mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────

export default function ReferralDashboardClient({ stats, referrals, leaderboard, chart }: Props) {
  const [showModal, setShowModal] = useState(false);

  const {
    referralUrl,
    referralCode,
    totalReferrals,
    activeReferrals,
    totalEarnedDollars,
    pendingEarningsDollars,
    projectedAnnualDollars,
  } = stats;

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Your Referrals</h1>
        <p className="text-gray-500 mt-1">
          Earn <span className="font-semibold text-green-600">${20}/year</span> for every member
          you refer — automatically, every year they stay subscribed.
        </p>
      </div>

      {/* ── Referral link block ── */}
      <Card className="bg-gradient-to-br from-navy/5 to-blue-accent/5 border border-blue-accent/20">
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <p className="text-sm text-gray-500 mt-0.5">Share this link — when someone joins, you earn $20/year.</p>
        </CardHeader>
        <CardContent>
          {referralUrl ? (
            <>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                <span className="flex-1 text-navy font-mono text-sm truncate select-all">
                  {referralUrl}
                </span>
                <CopyButton url={referralUrl} />
              </div>
              <div className="mt-3">
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy/90 transition-colors shadow-md"
                >
                  <span>📤</span> More Ways to Share
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Your referral link will appear here once your account is active.</p>
          )}
        </CardContent>
      </Card>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Referrals"
          value={String(totalReferrals)}
          sub={`${activeReferrals} active`}
        />
        <StatCard
          label="Active Referrals"
          value={String(activeReferrals)}
          sub={`$${projectedAnnualDollars}/yr projected`}
          color="text-green-700"
        />
        <StatCard
          label="Total Earned"
          value={`$${totalEarnedDollars.toFixed(2)}`}
          sub="all-time approved"
          color="text-green-700"
        />
        <StatCard
          label="Pending Earnings"
          value={`$${pendingEarningsDollars.toFixed(2)}`}
          sub="awaiting approval"
          color="text-yellow-600"
        />
      </div>

      {/* ── Leaderboard badge ── */}
      {leaderboard && <LeaderboardBadge pos={leaderboard} />}

      {/* ── Referrals table ── */}
      <div>
        <h2 className="text-lg font-bold text-navy mb-3">Your Referred Members</h2>
        <ReferralsTable referrals={referrals} />
      </div>

      {/* ── Earnings chart ── */}
      <EarningsChart data={chart} />

      {/* ── Tips ── */}
      <TipsSection activeReferrals={activeReferrals} feePerReferral={20} />

      {/* ── Share modal ── */}
      {showModal && referralUrl && (
        <ShareModal
          url={referralUrl}
          referralCode={referralCode ?? ""}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
