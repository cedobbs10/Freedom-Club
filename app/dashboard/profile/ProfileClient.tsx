"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PrivacyExplainer from "@/components/PrivacyExplainer";
import {
  saveAnonymousProfile,
  updateAccountProfile,
  changePassword,
  computeProfileCompletion,
  type AnonymousProfileData,
  type FullProfile,
  type ProfileCompletion,
} from "@/app/actions/profile";

// ─── Field options (mirrors onboarding wizard) ────────────────────────────────

const AGE_RANGES = [
  { value: "18-24", label: "18 – 24" }, { value: "25-34", label: "25 – 34" },
  { value: "35-44", label: "35 – 44" }, { value: "45-54", label: "45 – 54" },
  { value: "55-64", label: "55 – 64" }, { value: "65+",   label: "65 or older" },
];
const INCOME_RANGES = [
  { value: "under_30k",  label: "Under $30,000"       },
  { value: "30k_50k",    label: "$30,000 – $50,000"   },
  { value: "50k_75k",    label: "$50,000 – $75,000"   },
  { value: "75k_100k",   label: "$75,000 – $100,000"  },
  { value: "100k_150k",  label: "$100,000 – $150,000" },
  { value: "150k_plus",  label: "$150,000+"           },
];
const SEX_OPTIONS = [
  { value: "male",           label: "Male"            },
  { value: "female",         label: "Female"          },
  { value: "other",          label: "Other"           },
  { value: "prefer_not_say", label: "Prefer not to say" },
];
const MARITAL_STATUSES = [
  { value: "single",          label: "Single"          },
  { value: "married",         label: "Married"         },
  { value: "divorced",        label: "Divorced"        },
  { value: "widowed",         label: "Widowed"         },
  { value: "prefer_not_say",  label: "Prefer not to say" },
];
const EDUCATION_LEVELS = [
  { value: "high_school",    label: "High School / GED"            },
  { value: "some_college",   label: "Some College"                 },
  { value: "associates",     label: "Associate's Degree"           },
  { value: "bachelors",      label: "Bachelor's Degree"            },
  { value: "masters",        label: "Master's Degree"              },
  { value: "doctorate",      label: "Doctorate / Professional"     },
  { value: "prefer_not_say", label: "Prefer not to say"            },
];
const INTERESTS = [
  "Technology", "Health & Wellness", "Finance", "Home & Garden",
  "Automotive", "Food & Cooking", "Sports & Fitness", "Travel",
  "Fashion & Beauty", "Entertainment",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SelectField({
  label, value, onChange, options, hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-1.5">{hint}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-accent focus:border-transparent"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function CompletionRing({ percentage }: { percentage: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const color = percentage === 100 ? "#16a34a" : percentage >= 70 ? "#2E75B6" : "#f59e0b";

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="shrink-0">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
      <circle
        cx="44" cy="44" r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x="44" y="40" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1B3A5C">{percentage}%</text>
      <text x="44" y="54" textAnchor="middle" fontSize="9" fill="#6B7280">complete</text>
    </svg>
  );
}

function CompletionBanner({ completion }: { completion: ProfileCompletion }) {
  const { percentage, isComplete, missingFields } = completion;

  if (isComplete) {
    return (
      <div className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
        <span className="text-3xl">🏆</span>
        <div className="flex-1">
          <p className="font-bold text-green-800">Profile 100% Complete — Priority Member!</p>
          <p className="text-green-700 text-sm mt-0.5">
            You now have <strong>priority access to higher-paying video ads</strong> from premium brands.
            Your anonymous profile helps brands target their ideal audience — and pays you more for it.
          </p>
        </div>
        <div className="shrink-0 px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
          ★ Priority
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-accent/30 rounded-2xl px-5 py-4 flex items-start gap-4">
      <CompletionRing percentage={percentage} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-navy text-base">
          {percentage === 0 ? "Start your anonymous profile to unlock more earnings" : `${percentage}% complete — keep going!`}
        </p>
        <p className="text-sm text-gray-600 mt-0.5 mb-3">
          Complete all 7 fields to unlock{" "}
          <span className="font-semibold text-blue-accent">priority access to higher-paying video ads</span>.
          Brands pay more to reach specific audiences — you benefit directly.
        </p>
        {missingFields.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {missingFields.map((f) => (
              <span key={f} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                Missing: {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  profile: FullProfile;
}

export default function ProfileClient({ profile }: Props) {
  // ── Account state ──
  const [fullName, setFullName]           = useState(profile.fullName ?? "");
  const [nameSaved, setNameSaved]         = useState(false);
  const [nameError, setNameError]         = useState("");
  const [nameTransition, startNameSave]   = useTransition();

  // ── Password state ──
  const [showPassword, setShowPassword]   = useState(false);
  const [newPass, setNewPass]             = useState("");
  const [confirmPass, setConfirmPass]     = useState("");
  const [passMsg, setPassMsg]             = useState<{ ok: boolean; text: string } | null>(null);
  const [passTransition, startPassSave]   = useTransition();

  // ── Anonymous profile state ──
  const init: AnonymousProfileData = profile.anonymous ?? {
    age_range: "", income_range: "", sex: "", marital_status: "",
    education_level: "", zip_code: "", interests: [],
  };
  const [anon, setAnon]                   = useState<AnonymousProfileData>(init);
  const [anonMsg, setAnonMsg]             = useState<{ ok: boolean; text: string } | null>(null);
  const [anonTransition, startAnonSave]   = useTransition();

  const completion: ProfileCompletion = computeProfileCompletion(anon);

  function setField(key: keyof AnonymousProfileData, value: string) {
    setAnon((prev) => ({ ...prev, [key]: value }));
    setAnonMsg(null);
  }

  function toggleInterest(interest: string) {
    setAnon((prev) => {
      const has = prev.interests.includes(interest);
      return {
        ...prev,
        interests: has
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest],
      };
    });
    setAnonMsg(null);
  }

  // ── Save handlers ──

  function handleSaveName() {
    setNameError(""); setNameSaved(false);
    startNameSave(async () => {
      const result = await updateAccountProfile({ fullName });
      if ("message" in result) setNameError(result.message);
      else setNameSaved(true);
    });
  }

  function handleChangePassword() {
    setPassMsg(null);
    startPassSave(async () => {
      const result = await changePassword(newPass, confirmPass);
      if ("message" in result) setPassMsg({ ok: false, text: result.message });
      else {
        setPassMsg({ ok: true, text: "Password updated successfully!" });
        setNewPass(""); setConfirmPass("");
        setTimeout(() => setShowPassword(false), 1500);
      }
    });
  }

  function handleSaveAnon() {
    setAnonMsg(null);
    startAnonSave(async () => {
      const result = await saveAnonymousProfile(anon);
      if ("message" in result) setAnonMsg({ ok: false, text: result.message });
      else setAnonMsg({ ok: true, text: "Anonymous profile saved!" });
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-navy">Your Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account and anonymous profile settings.</p>
      </div>

      {/* ── Completion gamification banner ── */}
      <CompletionBanner completion={completion} />

      {/* ═══ SECTION A: Account ═══════════════════════════════════════════════ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center shrink-0">
              <span className="text-white text-lg">👤</span>
            </div>
            <div>
              <CardTitle>Your Account</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <span className="text-red-500">🔒</span>
                This information is <strong>private and never shared</strong> with anyone.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Full name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setNameSaved(false); setNameError(""); }}
                placeholder="Your full name"
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
              />
              <Button
                size="sm"
                onClick={handleSaveName}
                loading={nameTransition}
                disabled={!fullName.trim() || nameTransition}
              >
                {nameSaved ? "✓ Saved" : "Save"}
              </Button>
            </div>
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
            {nameSaved && !nameError && (
              <p className="text-green-600 text-xs mt-1">Name updated successfully!</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
              <span className="text-sm text-gray-700 flex-1">{profile.email}</span>
              <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">read-only</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Email is managed through your sign-in credentials and cannot be changed here.
            </p>
          </div>

          {/* Password change */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <button
                onClick={() => { setShowPassword((s) => !s); setPassMsg(null); }}
                className="text-sm text-blue-accent hover:text-blue-dark font-medium"
              >
                {showPassword ? "Cancel" : "Change Password"}
              </button>
            </div>
            {showPassword && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
                  />
                </div>
                {passMsg && (
                  <p className={`text-sm ${passMsg.ok ? "text-green-600" : "text-red-500"}`}>
                    {passMsg.text}
                  </p>
                )}
                <Button
                  size="sm"
                  onClick={handleChangePassword}
                  loading={passTransition}
                  disabled={!newPass || !confirmPass || passTransition}
                >
                  Update Password
                </Button>
              </div>
            )}
            {!showPassword && (
              <p className="text-sm text-gray-400">••••••••••••</p>
            )}
          </div>

          {/* Member since */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Member since{" "}
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══ SECTION B: Anonymous Profile ════════════════════════════════════ */}
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-white text-lg">🛡️</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-navy">Your Anonymous Profile</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Shared with manufacturers <strong>only in aggregate</strong> — your identity is never revealed.
              Complete it to unlock priority access to higher-paying brand videos.
            </p>
          </div>
        </div>

        {/* Privacy explainer */}
        <PrivacyExplainer />

        {/* The 7 fields */}
        <Card>
          <CardContent className="space-y-5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <SelectField
                label="Age Range"
                value={anon.age_range}
                onChange={(v) => setField("age_range", v)}
                options={AGE_RANGES}
                hint="Helps brands target the right age group."
              />
              <SelectField
                label="Household Income Range"
                value={anon.income_range}
                onChange={(v) => setField("income_range", v)}
                options={INCOME_RANGES}
                hint="Unlocks relevant offers and rebates."
              />
              <SelectField
                label="Sex"
                value={anon.sex}
                onChange={(v) => setField("sex", v)}
                options={SEX_OPTIONS}
              />
              <SelectField
                label="Marital Status"
                value={anon.marital_status}
                onChange={(v) => setField("marital_status", v)}
                options={MARITAL_STATUSES}
              />
              <SelectField
                label="Highest Education Level"
                value={anon.education_level}
                onChange={(v) => setField("education_level", v)}
                options={EDUCATION_LEVELS}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Zip Code</label>
                <p className="text-xs text-gray-500 mb-1.5">
                  5-digit zip only — no street address, no exact location.
                </p>
                <input
                  type="text"
                  value={anon.zip_code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                    setField("zip_code", val);
                  }}
                  placeholder="e.g. 33401"
                  maxLength={5}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-accent"
                />
              </div>
            </div>

            {/* Interests (full width) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Interests{" "}
                <span className="text-gray-400 font-normal">(select all that apply)</span>
              </label>
              <p className="text-xs text-gray-500 mb-2.5">
                Select your interests so brands can show you relevant products and offers.
              </p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => {
                  const selected = anon.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        selected
                          ? "bg-blue-accent text-white border-blue-accent shadow-sm"
                          : "bg-white text-gray-600 border-gray-300 hover:border-blue-accent hover:text-blue-accent"
                      }`}
                    >
                      {selected && <span className="mr-1">✓</span>}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save + feedback */}
            <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
              <Button
                onClick={handleSaveAnon}
                loading={anonTransition}
                disabled={anonTransition}
              >
                Save Anonymous Profile
              </Button>
              {anonMsg && (
                <p className={`text-sm ${anonMsg.ok ? "text-green-600" : "text-red-500"}`}>
                  {anonMsg.ok ? "✓ " : ""}{anonMsg.text}
                </p>
              )}
            </div>

            {/* Inline completion progress */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Profile Completion
                </span>
                <span className={`text-sm font-bold ${
                  completion.isComplete ? "text-green-600"
                  : completion.percentage >= 70 ? "text-blue-accent"
                  : "text-amber-600"
                }`}>
                  {completion.completedCount}/{completion.totalCount} fields
                </span>
              </div>
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completion.isComplete ? "bg-green-500"
                    : completion.percentage >= 70 ? "bg-blue-accent"
                    : "bg-amber-400"
                  }`}
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
              {!completion.isComplete && (
                <p className="text-xs text-gray-500 mt-2">
                  {completion.missingFields.length === 1
                    ? `Just 1 more field to unlock Priority Member status: ${completion.missingFields[0]}`
                    : `${completion.missingFields.length} fields left to unlock Priority Member status`}
                </p>
              )}
              {completion.isComplete && (
                <p className="text-xs text-green-600 mt-2 font-medium">
                  ★ Priority Member — you have access to the highest-paying video ads.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
