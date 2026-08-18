"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HistoryTable from "@/components/HistoryTable";

interface VettingRecord {
  _id: string;
  candidateName: string;
  nin: string;
  overallVerdict: "verified" | "needs_review" | "failed";
  createdAt: string;
}

export default function HistoryPage() {
  const [vettings, setVettings] = useState<VettingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vettings")
      .then((r) => r.json())
      .then((data) => {
        setVettings(data.vettings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-bg-warm">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary-dark">Vetting History</h1>
          <p className="text-text-muted text-sm mt-1">
            All your past vettings, sorted by date.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 mx-auto border-4 border-primary/30 border-t-primary rounded-full" />
          </div>
        ) : (
          <HistoryTable vettings={vettings} />
        )}
      </main>
    </div>
  );
}