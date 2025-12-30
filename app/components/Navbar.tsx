import Link from "next/link";

export default function Navbar() {
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

        {/* Navigation Links */}
        <div className="flex space-x-8 font-medium text-gray-600">
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
      </div>
    </nav>
  );
}
