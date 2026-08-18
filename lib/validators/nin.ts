import type { ValidatorResult } from "./index";

/* ---------- MOCK NIN REGISTRY ----------
 * A "very big" in-app mock list, treated like an internal API.
 * swap with a licensed aggregator (NIMC/Dojah/Prembly/Youverify)
 * in production by replacing the lookupNIN() function below — nothing
 * else in the codebase needs to change.
 */
interface MockNinRecord {
  firstname: string;
  lastname: string;
  middlename?: string;
  state: string;
  dob: string;
  gender: string;
  phone: string;
}

type MockNinRegistry = Record<string, MockNinRecord>;

const MOCK_NIN_REGISTRY: MockNinRegistry = {
  "12345678901": { firstname: "Adebayo", lastname: "Okafor", middlename: "Emeka", state: "Lagos",      dob: "1990-04-15", gender: "Male",   phone: "08030000001" },
  "70123456789": { firstname: "Jane",    lastname: "Doe",                          state: "Abuja",     dob: "1995-08-22", gender: "Female", phone: "08030000002" },
  "22222222222": { firstname: "Chidi",   lastname: "Okonkwo",                      state: "Anambra",   dob: "1988-12-01", gender: "Male",   phone: "08030000003" },
  "33333333333": { firstname: "Aisha",   lastname: "Bello",                         state: "Kano",      dob: "1993-06-20", gender: "Female", phone: "08030000004" },
  "44444444444": { firstname: "Tunde",   lastname: "Adeyemi",                        state: "Oyo",       dob: "1985-09-12", gender: "Male",   phone: "08030000005" },
  "55555555555": { firstname: "Folake",  lastname: "Akinola", middlename: "Bukola",    state: "Osun",      dob: "1992-03-25", gender: "Female", phone: "08030000006" },
  "66666666666": { firstname: "Emeka",   lastname: "Eze",                            state: "Enugu",     dob: "1987-07-08", gender: "Male",   phone: "08030000007" },
  "77777777777": { firstname: "Ngozi",   lastname: "Okafor",                         state: "Imo",       dob: "1991-11-14", gender: "Female", phone: "08030000008" },
  "88888888888": { firstname: "Ibrahim", lastname: "Sani",                           state: "Kaduna",    dob: "1986-05-30", gender: "Male",   phone: "08030000009" },
  "99999999999": { firstname: "Yetunde", lastname: "Ogun",                           state: "Ogun",      dob: "1994-02-18", gender: "Female", phone: "08030000010" },
  "10101010101": { firstname: "Olusegun", lastname: "Adelaja",                        state: "Kwara",     dob: "1989-08-22", gender: "Male",   phone: "08030000011" },
  "12121212121": { firstname: "Femi",    lastname: "Falana",                         state: "Lagos",     dob: "1993-04-09", gender: "Male",   phone: "08030000012" },
  "13131313131": { firstname: "Bisi",    lastname: "Lawal",                          state: "Oyo",       dob: "1997-10-05", gender: "Female", phone: "08030000013" },
  "14141414141": { firstname: "Aminu",   lastname: "Garba",                          state: "Borno",     dob: "1984-12-30", gender: "Male",   phone: "08030000014" },
  "15151515151": { firstname: "Chinwe",  lastname: "Eke",                            state: "Abia",      dob: "1996-01-17", gender: "Female", phone: "08030000015" },
  "16161616161": { firstname: "Babatunde", lastname: "Kazeem",                        state: "Oyo",       dob: "1988-06-25", gender: "Male",   phone: "08030000016" },
  "17171717171": { firstname: "Funmilola", lastname: "Afolabi",                       state: "Ekiti",     dob: "1990-09-14", gender: "Female", phone: "08030000017" },
  "18181818181": { firstname: "Segun",   lastname: "Adebayo",                        state: "Lagos",     dob: "1987-03-11", gender: "Male",   phone: "08030000018" },
};

/**
 * Mock registry lookup. Treat it like an internal API call:
 * returns null on not-found, returns the record on hit.
 * A tiny delay simulates network latency for realistic UX.
 */
async function lookupNIN(nin: string): Promise<MockNinRecord | null> {
  await new Promise((r) => setTimeout(r, 50)); // tiny simulated latency
  return MOCK_NIN_REGISTRY[nin] || null;
}

/* ---------- Matching primitives ---------- */
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

/* ---------- Main validation ---------- */
export interface NinValidationInput {
  nin: string;
  candidateName: string;
  stateOfOrigin?: string;
}

export async function validateNIN(input: NinValidationInput): Promise<ValidatorResult> {
  const { nin, candidateName, stateOfOrigin } = input;
  const cleaned = nin.replace(/\s/g, "");

  // 1. Format check
  if (!/^\d{11}$/.test(cleaned)) {
    return {
      component: "nin",
      valid: false,
      reason: "NIN must be exactly 11 digits",
      score: 0,
      details: { formatCheck: false },
    };
  }

  // 2. Mock-registry lookup
  const record = await lookupNIN(cleaned);
  if (!record) {
    return {
      component: "nin",
      valid: false,
      reason: "NIN not found in the registry",
      score: 0.1,
      details: { formatCheck: true, recordFound: false, provider: "mock" },
    };
  }

  // 3. Name match (Levenshtein on first/last tokens vs registry)
  const { score: nameScore } = computeNameMatch(candidateName, {
    firstname: record.firstname,
    lastname: record.lastname,
    middlename: record.middlename,
  });

  // 4. State-of-origin match (only meaningful when the user supplied one)
  let stateMatch: boolean | undefined;
  if (stateOfOrigin && stateOfOrigin.trim()) {
    const a = normalizeState(stateOfOrigin).toLowerCase();
    const b = normalizeState(record.state).toLowerCase();
    stateMatch = a === b;
  }

  // 5. Combine scores
  const hasState = stateMatch !== undefined;
  const wName = hasState ? 0.6 : 1;
  const wState = hasState ? 0.4 : 0;
  const sState = stateMatch === false ? 0 : 1;
  const finalScore = Math.round((nameScore * wName + sState * wState) * 100) / 100;

  const overallValid = finalScore >= 0.7;

  return {
    component: "nin",
    valid: overallValid,
    reason: overallValid
      ? `NIN verified — name ${nameScore >= 0.85 ? "matches" : "closely matches"}`
      : "NIN mismatch detected",
    score: finalScore,
    details: {
      formatCheck: true,
      recordFound: true,
      provider: "mock",
      nameMatch: Math.round(nameScore * 100) / 100,
      stateMatch: stateMatch !== undefined ? (stateMatch ? "match" : "mismatch") : undefined,
      officialName: `${record.firstname} ${record.lastname}`,
      officialState: record.state,
    } as Record<string, unknown>,
  };
}

/** Exported so the report / documentation can list known test NINs. */
export const MOCK_TEST_NINS = Object.keys(MOCK_NIN_REGISTRY);
