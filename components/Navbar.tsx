"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "./ui/Button";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FC</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Freedom Club
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#how-it-works"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#earn"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Earn
            </Link>
            <Link
              href="#pricing"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Pricing
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link href="/signup">
              <Button size="sm">Join Now</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          <Link href="#how-it-works" className="text-white/80 hover:text-white text-sm font-medium" onClick={() => setMobileOpen(false)}>How It Works</Link>
          <Link href="#earn" className="text-white/80 hover:text-white text-sm font-medium" onClick={() => setMobileOpen(false)}>Earn</Link>
          <Link href="#pricing" className="text-white/80 hover:text-white text-sm font-medium" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <hr className="border-white/10" />
          <Link href="/login" className="text-white/80 hover:text-white text-sm font-medium" onClick={() => setMobileOpen(false)}>Sign In</Link>
          <Link href="/signup" onClick={() => setMobileOpen(false)}>
            <Button size="sm" className="w-full">Join Now</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
