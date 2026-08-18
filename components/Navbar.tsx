"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, User, LogOut, LayoutDashboard, History } from "lucide-react";

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
    <nav className="fixed top-0 left-0 z-50 w-full px-3  md:top-4 md:left-1/2 md:w-[90%] md:max-w-5xl md:-translate-x-1/2 ">
      <div className="w-full rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-sm md:rounded-full md:bg-white/20 md:backdrop-blur-xl md:border md:border-white/30 md:shadow-xl md:bg-white/20">
        <div className="px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-800 md:text-primary-dark"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white md:bg-primary">
                VM
              </span>
              <span className="hidden sm:inline">VettMe</span>
            </Link>

            {user ? (
              <>
                {/* Desktop menu */}
                <div className="hidden md:flex items-center gap-6">
                  <Link
                    href="/dashboard"
                    className={`text-sm font-medium transition-opacity hover:opacity-80 text-slate-700 ${
                      isActive("/dashboard")
                        ? "opacity-100 underline underline-offset-4 decoration-emerald-500"
                        : "opacity-70"
                    }`}
                  >
                    New Vetting
                  </Link>
                  <Link
                    href="/history"
                    className={`text-sm font-medium transition-opacity hover:opacity-80 text-slate-700 ${
                      isActive("/history")
                        ? "opacity-100 underline underline-offset-4 decoration-emerald-500"
                        : "opacity-70"
                    }`}
                  >
                    History
                  </Link>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-700">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 shadow-sm"
                  >
                    Sign out
                  </button>
                </div>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100 md:hidden text-slate-700 transition-colors"
                  aria-label="Toggle menu"
                >
                  {menuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-sm text-slate-700 hover:bg-slate-100 px-4 py-1.5 rounded-full transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-1.5 rounded-full transition-colors font-medium shadow-sm"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu - slides down */}
          {menuOpen && user && (
            <div className="mt-3 border-t border-slate-200/60 pt-3 md:hidden animate-slideDown">
              <div className="space-y-1">
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  New Vetting
                </Link>
                <Link
                  href="/history"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive("/history")
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <History className="h-5 w-5" />
                  History
                </Link>
                <div className="border-t border-slate-200/60 my-2" />
                <div className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600">
                  <User className="h-5 w-5" />
                  {user.name}
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <LogOut className="h-5 w-5" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tailwind animation for slideDown - add to your globals.css if not present */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
}