"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        {/* Logo Area */}
        <Link
          href="/"
          className="text-2xl font-bold text-blue-600 tracking-tight hover:opacity-80 transition"
        >
          BMES TMU
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-8 font-medium text-gray-600">
          <Link href="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition">
            About
          </Link>
          <Link href="/team" className="hover:text-blue-600 transition">
            Team
          </Link>
          <Link href="/events" className="hover:text-blue-600 transition">
            Events
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition">
            Contact
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-md p-1"
            aria-label="Toggle Navigation"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12" // X icon
                    : "M4 6h16M4 12h16M4 18h16" // Hamburger icon
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-inner">
          <div className="px-6 py-4 flex flex-col space-y-4 font-medium text-gray-600">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-blue-600 transition block"
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-blue-600 transition block"
            >
              About
            </Link>
            <Link
              href="/team"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-blue-600 transition block"
            >
              Team
            </Link>
            <Link
              href="/events"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-blue-600 transition block"
            >
              Events
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-blue-600 transition block"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
