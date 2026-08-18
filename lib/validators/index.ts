import { validateEmail } from "./email";
import { validatePhone } from "./phone";
import { validateNIN } from "./nin";
import { validateBVN } from "./bvn";

export interface ValidatorResult {
  component: string;
  valid: boolean;
  reason: string;
  score: number;
  details?: Record<string, unknown>;
}

export interface ValidationRequest {
  email: string;
  phone: string;
  nin: string;
  candidateName: string;
  stateOfOrigin?: string;
  bvn?: string;
}

export interface ValidationResponse {
  results: ValidatorResult[];
  overallVerdict: "verified" | "needs_review" | "failed";
  overallScore: number;
}

export async function runValidation(req: ValidationRequest): Promise<ValidationResponse> {
  const results: ValidatorResult[] = [];

  // 1. Email
  results.push(validateEmail(req.email));

  // 2. Phone
  results.push(await validatePhone(req.phone));

  // 3. NIN (async — may call Didit or mock)
  const ninResult = await validateNIN({
    nin: req.nin,
    candidateName: req.candidateName,
    stateOfOrigin: req.stateOfOrigin,
  });
  results.push(ninResult);

  // 4. BVN (optional)
  if (req.bvn && req.bvn.trim()) {
    results.push(validateBVN(req.bvn));
  }

  // 5. Password (not part of the vetting — we only validate account passwords on signup)

  // Compute overall verdict
  const validCount = results.filter((r) => r.valid).length;
  const totalScore = results.reduce((s, r) => s + r.score, 0);
  const overallScore = Math.round((totalScore / results.length) * 100) / 100;

  let overallVerdict: "verified" | "needs_review" | "failed";
  if (overallScore >= 0.8 && validCount === results.length) {
    overallVerdict = "verified";
  } else if (overallScore >= 0.4) {
    overallVerdict = "needs_review";
  } else {
    overallVerdict = "failed";
  }

  return { results, overallVerdict, overallScore };
}