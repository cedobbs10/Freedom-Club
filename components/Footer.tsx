import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FC</span>
              </div>
              <span className="font-bold text-lg">Freedom Club</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              America&apos;s first manufacturer-direct marketplace where consumers own their data,
              earn real money, and get the best prices — guaranteed.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Members</h4>
            <ul className="space-y-2">
              <li><Link href="/signup" className="text-white/70 hover:text-white text-sm transition-colors">Join Freedom Club</Link></li>
              <li><Link href="/login" className="text-white/70 hover:text-white text-sm transition-colors">Sign In</Link></li>
              <li><Link href="#how-it-works" className="text-white/70 hover:text-white text-sm transition-colors">How It Works</Link></li>
              <li><Link href="#pricing" className="text-white/70 hover:text-white text-sm transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-white/70 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-white/70 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-white/70 hover:text-white text-sm transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} Freedom Club. All rights reserved.
          </p>
          <p className="text-white/40 text-xs">
            Patent-Pending Privacy Technology
          </p>
        </div>
      </div>
    </footer>
  );
}
