// PrivacyExplainer — visual breakdown of what is and isn't shared.
// Server component (no interactivity needed).

const PRIVATE_ITEMS = [
  "Full name",
  "Email address",
  "Home / mailing address",
  "Phone number",
  "IP address & device info",
  "Browsing history",
  "Purchase history",
  "Exact location",
];

const SHARED_ITEMS = [
  { label: "Age range",       example: "e.g. 25–34"          },
  { label: "Income range",    example: "e.g. $50k–$75k"      },
  { label: "Sex",             example: "e.g. Male"           },
  { label: "Marital status",  example: "e.g. Married"        },
  { label: "Education level", example: "e.g. Bachelor's"     },
  { label: "Zip code",        example: "e.g. 33401"          },
  { label: "Interests",       example: "e.g. Technology"     },
];

interface Props {
  compact?: boolean; // smaller variant for inline use
}

export default function PrivacyExplainer({ compact = false }: Props) {
  return (
    <div className={`rounded-2xl border border-gray-200 overflow-hidden ${compact ? "" : "shadow-card"}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-navy to-blue-accent px-5 py-4 flex items-center gap-3">
        <span className="text-2xl">🛡️</span>
        <div>
          <p className="text-white font-bold text-base">Freedom Club Privacy Shield</p>
          <p className="text-white/70 text-xs mt-0.5">
            Your personal identity is never sold, shared, or exposed — ever.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
        {/* ── Private column ── */}
        <div className="bg-red-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">✕</span>
            </div>
            <p className="font-bold text-red-800 text-sm">Kept Private — Never Shared</p>
          </div>
          <ul className="space-y-1.5">
            {PRIVATE_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-red-700">
                <span className="text-red-400 shrink-0">🔒</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Shared column ── */}
        <div className="bg-green-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <p className="font-bold text-green-800 text-sm">Shared Anonymously — In Aggregate Only</p>
          </div>
          <ul className="space-y-1.5">
            {SHARED_ITEMS.map(({ label, example }) => (
              <li key={label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-green-700">
                  <span className="text-green-500 shrink-0">✅</span>
                  {label}
                </span>
                <span className="text-green-500 text-xs ml-2 shrink-0">{example}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer note */}
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          <strong className="text-gray-700">How it works:</strong> Brands only see aggregate counts —
          e.g. <em>"47 members aged 25–34 in zip 334xx interested in Technology."</em>{" "}
          Your individual responses are never exposed.
        </p>
      </div>
    </div>
  );
}
