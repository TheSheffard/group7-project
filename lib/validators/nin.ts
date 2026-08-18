import type { ValidatorResult } from "./index";

interface NinRecord {
  firstname: string;
  lastname: string;
  middlename?: string;
  state: string;
  dob: string;
  gender: string;
  phone: string;
}

const MOCK_RECORDS: Record<string, NinRecord> = {
  "12345678901": {
    firstname: "Adebayo", lastname: "Okafor", middlename: "Emeka",
    state: "Lagos", dob: "1990-04-15", gender: "Male", phone: "08030000001",
  },
  "70123456789": {
    firstname: "Jane", lastname: "Doe",
    state: "Abuja", dob: "1995-08-22", gender: "Female", phone: "08030000002",
  },
  "22222222222": {
    firstname: "Chidi", lastname: "Okonkwo",
    state: "Anambra", dob: "1988-12-01", gender: "Male", phone: "08030000003",
  },
};

function normalizeTokens(name: string): string[] {
  return name.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
}

function levenshteinSimilarity(a: string, b: string): number {
  const an = a.length, bn = b.length;
  const matrix: number[][] = Array.from({ length: bn + 1 }, () => []);
  for (let i = 0; i <= an; i++) matrix[0][i] = i;
  for (let i = 1; i <= bn; i++) matrix[i][0] = i;
  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return 1 - matrix[bn][an] / Math.max(an, bn);
}

function computeNameMatch(
  claimedName: string,
  official: { firstname: string; lastname: string; middlename?: string }
): { score: number } {
  const claimedTokens = normalizeTokens(claimedName);
  const firstNorm = official.firstname.toLowerCase();
  const lastNorm = official.lastname.toLowerCase();
  const midNorm = official.middlename?.toLowerCase();
  let bestFirst = 0, bestLast = 0;
  for (const token of claimedTokens) {
    const fs = levenshteinSimilarity(token, firstNorm);
    const ls = levenshteinSimilarity(token, lastNorm);
    const ms = midNorm ? levenshteinSimilarity(token, midNorm) : 0;
    bestFirst = Math.max(bestFirst, fs, ms * 0.85);
    bestLast = Math.max(bestLast, ls, ms * 0.85);
  }
  return { score: bestFirst * 0.5 + bestLast * 0.5 };
}

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue",
  "Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu",
  "Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi",
  "Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo",
  "Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","FCT",
];

function normalizeState(input: string): string {
  const cleaned = input.trim().toLowerCase().replace(/\s+/g, "");
  for (const st of NIGERIAN_STATES) {
    if (st.toLowerCase().replace(/\s+/g, "") === cleaned) return st;
  }
  for (const st of NIGERIAN_STATES) {
    if (cleaned.includes(st.toLowerCase().slice(0, 3))) return st;
  }
  return input.trim();
}

// ---------- Didit API (correct endpoint: /v3/database-validation/) ----------
interface DiditMatch {
  firstName: string;
  lastName: string;
  fullName: string;
  matchScore: number;
}

async function diditLookup(
  nin: string, firstName: string, lastName: string
): Promise<DiditMatch | null> {
  const key = process.env.DIDIT_API_KEY;
  if (!key) return null;

  try {
    const fd = new FormData();
    fd.append("issuing_state", "NGA");
    fd.append("services", "nga_national_id");
    fd.append("first_name", firstName);
    fd.append("last_name", lastName);
    fd.append("national_id", nin);

    const res = await fetch("https://verification.didit.me/v3/database-validation/", {
      method: "POST",
      headers: { "x-api-key": key },
      body: fd,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(
        res.status === 403
          ? "Didit 403: out of credits for nga_national_id (paid module). Free tier covers ID + Liveness + FaceMatch only. Falling back to mock."
          : "Didit error: " + res.status + " " + errText.slice(0, 200)
      );
      return null;
    }

    const data = await res.json();
    console.log("Didit response:", JSON.stringify(data, null, 2));

    if (data?.status === "Approved" || data?.match_type?.includes("match")) {
      const src = data.validations?.[0]?.source_data;
      if (src?.name_match_score) {
        return {
          firstName: src.first_name || src.full_name?.split(" ")[0] || "",
          lastName: src.last_name || src.full_name?.split(" ").slice(1).join(" ") || "",
          fullName: src.full_name || "",
          matchScore: parseFloat(src.name_match_score),
        };
      }
    }
    return null;
  } catch (err) {
    console.warn("Didit fetch failed:", err);
    return null;
  }
}

// ---------- Main validation ----------
export interface NinValidationInput {
  nin: string;
  candidateName: string;
  stateOfOrigin?: string;
}

export async function validateNIN(input: NinValidationInput): Promise<ValidatorResult> {
  const { nin, candidateName, stateOfOrigin } = input;
  const cleaned = nin.replace(/\s/g, "");

  if (!/^\d{11}$/.test(cleaned)) {
    return {
      component: "nin", valid: false,
      reason: "NIN must be exactly 11 digits", score: 0,
      details: { formatCheck: false },
    };
  }

  // Split name for API
  const tokens = candidateName.trim().split(/\s+/);
  const firstName = tokens[0] || "";
  const lastName = tokens.slice(1).join(" ") || firstName;

  // Try Didit live
  const live = await diditLookup(cleaned, firstName, lastName);

  let nameScore: number;
  let provider = "mock";
  let officialName = "";
  let officialState = "";
  let canCheckState = false;

  if (live) {
    provider = "didit";
    nameScore = live.matchScore;
    officialName = live.fullName;
    canCheckState = false; // Didit db validation does not return state
  } else {
    const rec = MOCK_RECORDS[cleaned];
    if (!rec) {
      return {
        component: "nin", valid: false,
        reason: "NIN not found in registry", score: 0.1,
        details: { formatCheck: true, recordFound: false, provider },
      };
    }
    const nm = computeNameMatch(candidateName, {
      firstname: rec.firstname, lastname: rec.lastname, middlename: rec.middlename,
    });
    nameScore = nm.score;
    officialName = rec.firstname + " " + rec.lastname;
    officialState = rec.state;
    canCheckState = true;
  }

  // State matching (mock only)
  let stateMatch: boolean | undefined;
  if (canCheckState && stateOfOrigin?.trim()) {
    stateMatch = normalizeState(stateOfOrigin).toLowerCase() === normalizeState(officialState).toLowerCase();
  }

  // Final score
  const hasState = canCheckState && !!stateOfOrigin?.trim();
  const wName = hasState ? 0.6 : 1;
  const wState = hasState ? 0.4 : 0;
  const sState = stateMatch === false ? 0 : 1;
  const finalScore = Math.round((nameScore * wName + sState * wState) * 100) / 100;
  const overallValid = finalScore >= 0.7;

  return {
    component: "nin",
    valid: overallValid,
    reason: overallValid
      ? "NIN verified - " + (nameScore >= 0.85 ? "name matches" : "name closely matches")
      : "NIN mismatch detected",
    score: finalScore,
    details: {
      formatCheck: true, recordFound: true, provider,
      nameMatch: Math.round(nameScore * 100) / 100,
      stateMatch: stateMatch !== undefined ? (stateMatch ? "match" : "mismatch") : "unavailable via live API",
      officialName,
      officialState: canCheckState ? officialState : "not returned by Didit",
    },
  };
}
