import type { ValidatorResult } from "./index";

export function validateBVN(bvn: string): ValidatorResult {
  const cleaned = bvn.replace(/\s/g, "");

  if (!/^\d{11}$/.test(cleaned)) {
    return {
      component: "bvn",
      valid: false,
      reason: "BVN must be exactly 11 digits",
      score: 0,
    };
  }

  // Luhn-style checksum verification
  let sum = 0;
  let alternate = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let n = parseInt(cleaned[i]!, 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }

  if (sum % 10 !== 0) {
    return {
     component: "bvn",
      valid: false,
      reason: "BVN failed checksum verification",
      score: 0.1,
    };
  }

  return {
    component: "bvn",
    valid: true,
    reason: "BVN format and checksum are valid",
    score: 1,
  };
}