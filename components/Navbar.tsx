"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      setUser(null);
      router.push("/auth/login");
    });
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-4 left-1/2 z-50 w-[90%] max-w-5xl -translate-x-1/2">
      <div className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl rounded-full px-6 py-2">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight flex items-center gap-2 text-primary-dark"
          >
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
              VM
            </span>
            VettMe
          </Link>

          {user ? (
            <>
              {/* Desktop menu */}
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-opacity hover:opacity-80 text-primary-dark ${
                    isActive("/dashboard")
                      ? "opacity-100 underline underline-offset-4 decoration-accent"
                      : "opacity-70"
                  }`}
                >
                  New Vetting
                </Link>
                <Link
                  href="/history"
                  className={`text-sm font-medium transition-opacity hover:opacity-80 text-primary-dark ${
                    isActive("/history")
                      ? "opacity-100 underline underline-offset-4 decoration-accent"
                      : "opacity-70"
                  }`}
                >
                  History
                </Link>
                <span className="text-sm text-primary-dark/30">|</span>
                <span className="text-sm text-primary-dark/80">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-primary text-white hover:bg-primary-dark px-4 py-1.5 rounded-full transition-colors shadow-sm"
                >
                  Sign out
                </button>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-white/20 text-primary-dark"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm text-primary-dark hover:bg-white/20 px-4 py-1.5 rounded-full transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm bg-primary text-white hover:bg-primary-dark px-4 py-1.5 rounded-full transition-colors font-medium shadow-sm"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {menuOpen && user && (
          <div className="md:hidden pb-3 pt-2 border-t border-white/20 space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-full hover:bg-white/20 text-sm text-primary-dark"
            >
              New Vetting
            </Link>
            <Link
              href="/history"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-full hover:bg-white/20 text-sm text-primary-dark"
            >
              History
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="block w-full text-left px-3 py-2 rounded-full hover:bg-white/20 text-sm text-primary-dark"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}