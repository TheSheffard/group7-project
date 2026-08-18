"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-warm flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo link */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
            VM
          </span>
          <span className="text-2xl font-bold text-primary-dark">VettMe</span>
        </Link>

        <div className="bg-white border border-border-warm rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-primary-dark mb-2">Welcome back</h1>
          <p className="text-text-muted text-sm mb-6">Sign in to start vetting candidates.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-dark mb-1.5">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-border-warm bg-white focus:border-primary outline-none transition-colors text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-dark mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-border-warm bg-white focus:border-primary outline-none transition-colors text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white hover:bg-primary-dark py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-text-muted text-center mt-6">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary-light hover:text-primary font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}