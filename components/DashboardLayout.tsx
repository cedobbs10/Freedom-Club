import Link from "next/link";
import { cn } from "@/lib/utils";
import DashboardSignOut from "@/components/DashboardSignOut";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: "home" | "videos" | "referrals" | "profile" | "privacy";
}

const navLinks = [
  { href: "/dashboard",           label: "Home",         tab: "home"      },
  { href: "/dashboard/videos",    label: "Watch Videos", tab: "videos"    },
  { href: "/dashboard/referrals", label: "Referrals",    tab: "referrals" },
  { href: "/dashboard/profile",   label: "Profile",      tab: "profile"   },
  { href: "/dashboard/privacy",   label: "🛡️ Privacy",   tab: "privacy"   },
] as const;

export default function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-blue-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">FC</span>
          </div>
          <span className="font-bold hidden sm:inline">Freedom Club</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4 text-sm overflow-x-auto">
          {navLinks.map(({ href, label, tab }) => (
            <Link
              key={tab}
              href={href}
              className={cn(
                "whitespace-nowrap px-2 py-1 rounded hover:text-white transition-colors",
                activeTab === tab
                  ? "text-white font-semibold"
                  : "text-white/70"
              )}
            >
              {label}
            </Link>
          ))}
          <DashboardSignOut />
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
    </div>
  );
}
