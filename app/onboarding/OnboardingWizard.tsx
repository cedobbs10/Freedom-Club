"use client";

import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveAnonymousProfile, type AnonymousProfileData } from "@/app/actions/profile";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 4;

const AGE_RANGES = [
  { value: "18-24",  label: "18 – 24" },
  { value: "25-34",  label: "25 – 34" },
  { value: "35-44",  label: "35 – 44" },
  { value: "45-54",  label: "45 – 54" },
  { value: "55-64",  label: "55 – 64" },
  { value: "65+",    label: "65 or older" },
];

const INCOME_RANGES = [
  { value: "under_30k",  label: "Under $30,000" },
  { value: "30k_50k",    label: "$30,000 – $50,000" },
  { value: "50k_75k",    label: "$50,000 – $75,000" },
  { value: "75k_100k",   label: "$75,000 – $100,000" },
  { value: "100k_150k",  label: "$100,000 – $150,000" },
  { value: "150k_plus",  label: "$150,000+" },
];

const MARITAL_STATUSES = [
  { value: "single",          label: "Single" },
  { value: "married",         label: "Married" },
  { value: "divorced",        label: "Divorced" },
  { value: "widowed",         label: "Widowed" },
  { value: "prefer_not_say",  label: "Prefer not to say" },
];

const EDUCATION_LEVELS = [
  { value: "high_school",     label: "High School / GED" },
  { value: "some_college",    label: "Some College" },
  { value: "associates",      label: "Associate's Degree" },
  { value: "bachelors",       label: "Bachelor's Degree" },
  { value: "masters",         label: "Master's Degree" },
  { value: "doctorate",       label: "Doctorate / Professional Degree" },
  { value: "prefer_not_say",  label: "Prefer not to say" },
];

const SEX_OPTIONS = [
  { value: "male",            label: "Male" },
  { value: "female",          label: "Female" },
  { value: "other",           label: "Other" },
  { value: "prefer_not_say",  label: "Prefer not to say" },
];

const INTERESTS = [
  "Technology", "Health & Wellness", "Finance", "Home & Garden",
  "Automotive", "Food & Cooking", "Sports & Fitness", "Travel",
  "Fashion & Beauty", "Entertainment",
];

const PLAN_BENEFITS = [
  "Earn $1.00 per video — up to 10 videos/month",
  "$20/year for every friend you refer",
  "Instant rebates from top consumer brands",
  "Anonymous profile — your PII is never sold",
  "D2C pricing directly from manufacturers",
  "Founding member recognition",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-navy">
          Step {step} of {TOTAL_STEPS}
        </span>
        <span className="text-sm text-gray-400">
          {Math.round((step / TOTAL_STEPS) * 100)}% complete
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-hero-gradient rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        {["Welcome", "Profile", "Plan", "Share"].map((label, i) => (
          <span
            key={label}
            className={`text-xs font-medium ${
              i + 1 <= step ? "text-blue-accent" : "text-gray-300"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SelectField({
  label, name, options, value, onChange, required,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-navy">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-navy focus:outline-none focus:ring-2 focus:ring-blue-accent focus:border-transparent transition-all duration-200"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Step 1: Welcome ──────────────────────────────────────────────────────────

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl">🎉</div>

      <div>
        <h2 className="text-3xl font-extrabold text-navy">
          Welcome to Freedom Club!
        </h2>
        <p className="text-gray-500 mt-2">
          You&apos;re now part of a movement to take back control of your data.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        {[
          {
            icon: "🎬",
            title: "Earn from videos",
            body: "Watch short brand videos and earn $1 each — up to $10/month.",
          },
          {
            icon: "👥",
            title: "Earn from referrals",
            body: "Invite friends and earn $20/year for each one who joins.",
          },
          {
            icon: "🔒",
            title: "Your privacy protected",
            body: "Your personal data is never sold. You control your anonymous profile.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-blue-50 border border-blue-100 rounded-xl p-4"
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <p className="font-bold text-navy text-sm">{item.title}</p>
            <p className="text-gray-600 text-sm mt-1">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <Button size="lg" className="w-full sm:w-auto px-12" onClick={onNext}>
          Get Started →
        </Button>
        <p className="text-xs text-gray-400 mt-3">
          Takes about 3 minutes to complete setup
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Anonymous Profile ────────────────────────────────────────────────

function StepProfile({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [fields, setFields] = useState<AnonymousProfileData>({
    age_range: "",
    income_range: "",
    sex: "",
    marital_status: "",
    education_level: "",
    zip_code: "",
    interests: [],
  });

  function set(key: keyof AnonymousProfileData) {
    return (value: string) => setFields((p) => ({ ...p, [key]: value }));
  }

  function toggleInterest(interest: string) {
    setFields((p) => ({
      ...p,
      interests: p.interests.includes(interest)
        ? p.interests.filter((i) => i !== interest)
        : [...p.interests, interest],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Client-side required check
    const required: (keyof AnonymousProfileData)[] = [
      "age_range", "income_range", "sex", "marital_status",
      "education_level", "zip_code",
    ];
    for (const key of required) {
      if (!fields[key]) {
        setError("Please complete all required fields.");
        return;
      }
    }
    if (!/^\d{5}$/.test(fields.zip_code)) {
      setError("Please enter a valid 5-digit zip code.");
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await saveAnonymousProfile(fields);
      if ("message" in result) {
        setError(result.message);
      } else {
        onNext();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-navy">
          Complete Your Anonymous Profile
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          This is how brands reach you — <strong>no name, no address, no personal info.</strong>{" "}
          Just broad ranges that let them target the right audience.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex gap-3 items-start">
        <span className="text-xl flex-shrink-0">🔒</span>
        <p className="text-sm text-navy">
          Your answers are aggregated with millions of other members.
          Manufacturers only see statistical ranges — never individual responses.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <SelectField
          label="Age Range"
          name="age_range"
          options={AGE_RANGES}
          value={fields.age_range}
          onChange={set("age_range")}
          required
        />
        <SelectField
          label="Household Income"
          name="income_range"
          options={INCOME_RANGES}
          value={fields.income_range}
          onChange={set("income_range")}
          required
        />
        <SelectField
          label="Marital Status"
          name="marital_status"
          options={MARITAL_STATUSES}
          value={fields.marital_status}
          onChange={set("marital_status")}
          required
        />
        <SelectField
          label="Education Level"
          name="education_level"
          options={EDUCATION_LEVELS}
          value={fields.education_level}
          onChange={set("education_level")}
          required
        />
      </div>

      {/* Sex — radio buttons */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-navy">
          Sex<span className="text-red-400 ml-0.5">*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {SEX_OPTIONS.map((o) => (
            <label
              key={o.value}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                fields.sex === o.value
                  ? "border-blue-accent bg-blue-50 text-navy font-medium"
                  : "border-gray-200 text-gray-600 hover:border-blue-accent"
              }`}
            >
              <input
                type="radio"
                name="sex"
                value={o.value}
                checked={fields.sex === o.value}
                onChange={() => set("sex")(o.value)}
                className="sr-only"
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      {/* Zip code */}
      <Input
        id="zip_code"
        label="Zip Code"
        type="text"
        inputMode="numeric"
        pattern="\d{5}"
        placeholder="e.g. 33480"
        maxLength={5}
        value={fields.zip_code}
        onChange={(e) => set("zip_code")(e.target.value.replace(/\D/g, ""))}
        required
      />

      {/* Interests */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-navy">
          Interests <span className="text-gray-400 font-normal">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => {
            const selected = fields.interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                  selected
                    ? "bg-navy text-white border-navy"
                    : "border-gray-200 text-gray-600 hover:border-navy hover:text-navy"
                }`}
              >
                {selected && "✓ "}
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onBack} disabled={isPending}>
          ← Back
        </Button>
        <Button type="submit" size="lg" className="flex-1" loading={isPending} disabled={isPending}>
          {isPending ? "Saving…" : "Save & Continue →"}
        </Button>
      </div>
    </form>
  );
}

// ─── Step 3: Choose Plan ──────────────────────────────────────────────────────

function StepPlan({
  onNext,
  onBack,
  onSkip,
}: {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-navy">Choose Your Plan</h2>
        <p className="text-gray-500 text-sm mt-1">
          Unlock all earning opportunities with a Freedom Club membership.
        </p>
      </div>

      {/* Plan card */}
      <div className="border-2 border-blue-accent rounded-2xl p-6 bg-white relative overflow-hidden">
        <div className="absolute top-4 right-4 bg-blue-accent text-white text-xs font-bold px-2.5 py-1 rounded-full">
          MOST POPULAR
        </div>

        <div className="flex items-end gap-1 mb-1">
          <span className="text-4xl font-extrabold text-navy">$10</span>
          <span className="text-gray-500 mb-1">/month</span>
        </div>
        <p className="text-sm text-gray-400 mb-5">or $100/year (save 17%)</p>

        <ul className="space-y-3 mb-6">
          {PLAN_BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3 text-sm text-gray-700">
              <svg
                className="w-4 h-4 text-blue-accent flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {benefit}
            </li>
          ))}
        </ul>

        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-5">
          <p className="text-sm text-green-800 font-medium">
            💡 Most members earn back their membership fee in the first month
            just from videos and referrals.
          </p>
        </div>

        <Button size="lg" className="w-full" onClick={onNext}>
          Continue to Payment →
        </Button>
        <p className="text-xs text-center text-gray-400 mt-3">
          Stripe-secured checkout • Cancel anytime • No hidden fees
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-gray-400 hover:text-gray-600 underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Share Your Link ──────────────────────────────────────────────────

function StepShare({
  referralCode,
  onBack,
}: {
  referralCode: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://freedomclub.com"}/signup?ref=${referralCode}`;
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard API
      const input = document.createElement("input");
      input.value = referralUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [referralUrl]);

  const shareText = encodeURIComponent(
    `I just joined Freedom Club — a marketplace that pays you to protect your privacy. Get $20 off your first year when you join with my link:`
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-3">🚀</div>
        <h2 className="text-2xl font-extrabold text-navy">
          Share Your Referral Link
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Earn <strong className="text-navy">$20/year</strong> for every friend
          who becomes a paying member — automatically, every year they stay.
        </p>
      </div>

      {/* Referral link box */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Your personal referral link
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm text-navy font-mono bg-white border border-gray-200 rounded-lg px-3 py-2.5 truncate">
            {referralUrl}
          </code>
          <Button
            type="button"
            variant={copied ? "secondary" : "primary"}
            size="sm"
            onClick={copyLink}
            className="flex-shrink-0 min-w-[80px]"
          >
            {copied ? "✓ Copied!" : "Copy"}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Your referral code: <strong className="text-navy font-mono">{referralCode}</strong>
        </p>
      </div>

      {/* Social share buttons */}
      <div>
        <p className="text-sm font-medium text-navy mb-3">Share via:</p>
        <div className="flex flex-wrap gap-3">
          {/* X / Twitter */}
          <a
            href={`https://x.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(referralUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Post on X
          </a>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Share on Facebook
          </a>

          {/* SMS */}
          <a
            href={`sms:?body=${shareText}%20${encodeURIComponent(referralUrl)}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Send a Text
          </a>
        </div>
      </div>

      {/* Earnings explainer */}
      <div className="bg-navy rounded-xl p-5 text-white">
        <p className="font-bold mb-2">How referral earnings work:</p>
        <ul className="space-y-1.5 text-sm text-white/80">
          <li className="flex gap-2">
            <span>1.</span>
            <span>Your friend signs up using your link</span>
          </li>
          <li className="flex gap-2">
            <span>2.</span>
            <span>They become a paying member ($10/month or $100/year)</span>
          </li>
          <li className="flex gap-2">
            <span>3.</span>
            <span>You earn <strong className="text-white">$20/year</strong> — credited every year they stay active</span>
          </li>
          <li className="flex gap-2">
            <span>4.</span>
            <span>No limit on how many friends you can refer</span>
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <Button
          size="lg"
          className="px-10"
          onClick={() => router.push("/dashboard")}
        >
          Go to My Dashboard →
        </Button>
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  referralCode: string;
}

export default function OnboardingWizard({ referralCode }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const next = useCallback(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS)), []);
  const back = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);
  const skip = useCallback(() => router.push("/dashboard"), [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2">
            <div className="w-9 h-9 bg-hero-gradient rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">FC</span>
            </div>
            <span className="text-navy font-bold text-lg">Freedom Club</span>
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar step={step} />

        {/* Step card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          {step === 1 && <StepWelcome onNext={next} />}
          {step === 2 && <StepProfile onNext={next} onBack={back} />}
          {step === 3 && <StepPlan onNext={next} onBack={back} onSkip={skip} />}
          {step === 4 && (
            <StepShare referralCode={referralCode} onBack={back} />
          )}
        </div>

        {/* Skip entire onboarding — only show on steps 2+ */}
        {step > 1 && step < 4 && (
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={skip}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Skip setup and go to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
