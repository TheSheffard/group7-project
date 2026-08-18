import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Mail,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Phone,
  IdCard,
} from "lucide-react";
import HeroActions from "@/components/HeroActions";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col ">
      <Navbar />

      {/* ===== HERO ===== */}
      <section className="flex-1 bg-bg-warm  flex items-center justify-center px-4 pt-8 pb-12 md:pt-24 md:pb-20">
        <div className="max-w-4xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
            {/* Left — Text */}
            <div className="lg:col-span-3 text-center lg:text-left">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full mb-5">
                Validation Component‑Based System
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                Know who you‘re <br />
                <span className="text-primary">really hiring.</span>
              </h1>
              <p className="text-text-muted text-base md:text-lg max-w-xl mx-auto lg:mx-0 mb-6">
                HR teams use VettMe to verify applicants before the interview.
                Enter a candidate’s details — name, NIN, phone, email — and our
                system validates everything in real time. Fake CV?{" "}
                <span className="font-semibold text-foreground">Caught.</span>
              </p>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
                <div className="flex items-center gap-1.5 text-sm text-text-muted">
                  <UserCheck size={16} className="text-primary" />
                  Name & NIN match
                </div>
                <div className="flex items-center gap-1.5 text-sm text-text-muted">
                  <Phone size={16} className="text-primary" />
                  Phone with country code
                </div>
                <div className="flex items-center gap-1.5 text-sm text-text-muted">
                  <Mail size={16} className="text-primary" />
                  Email format
                </div>
                <div className="flex items-center gap-1.5 text-sm text-text-muted">
                  <IdCard size={16} className="text-primary" />
                  State of origin check
                </div>
              </div>

              <HeroActions />
            </div>

            {/* Right — Illustration */}
            <div className="lg:col-span-2 hidden lg:flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck size={36} className="text-primary" />
                    </div>
                    <p className="text-sm text-text-muted font-medium">
                      Candidate <span className="text-primary">Verified</span>
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{" "}
                        NIN ✓
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{" "}
                        Phone ✓
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{" "}
                        Email ✓
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 w-20 h-20 bg-primary/5 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-primary/5 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            What gets validated
          </h2>
          <p className="text-text-muted mt-2">
            Every field matters. We check everything so you don‘t have to.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Mail,
              title: "Email & phone",
              desc: "Format validation with country code support. Ensures contact details are real and reachable.",
            },
            {
              icon: IdCard,
              title: "NIN & BVN",
              desc: "Format and checksum validation. Cross‑checks name and state of origin against NIN records.",
            },
            {
              icon: ClipboardList,
              title: "Audit trail",
              desc: "Every validation is logged with timestamps for easy review, compliance, and reference.",
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="bg-white border border-border-warm rounded-2xl p-6 hover:shadow-lg transition shadow-sm hover:border-primary/20"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-1">
                  {feat.title}
                </h3>
                <p className="text-text-muted text-sm">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border-warm py-6 text-center text-sm text-text-muted">
        <div className="max-w-5xl mx-auto px-4">
          <p>© 2026 VettMe — Group 7</p>
          <p className="text-xs mt-1">
            Design &amp; Implementation of a Validation Component‑Based System
          </p>
        </div>
      </footer>
    </div>
  );
}
