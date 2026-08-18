"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

export default function HeroActions() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  if (user) {
    return (
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold transition shadow-md shadow-primary/20"
      >
        Go to Dashboard <ArrowRight size={18} />
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-4">
      <Link
        href="/auth/signup"
        className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold transition shadow-md shadow-primary/20"
      >
        Start vetting <ArrowRight size={18} />
      </Link>
      <Link
        href="/auth/login"
        className="border border-border-warm bg-white text-foreground hover:bg-bg-warm px-8 py-3 rounded-lg font-semibold transition"
      >
        Sign in
      </Link>
    </div>
  );
}