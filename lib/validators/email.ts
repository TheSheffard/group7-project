import type { ValidatorResult } from "./index";

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "sharklasers.com",
  "tempmail.com", "10minutemail.com", "throwaway.com",
  "yopmail.com", "trashmail.com", "maildrop.cc",
]);

export function validateEmail(email: string): ValidatorResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      component: "email",
      valid: false,
      reason: "Invalid email format",
      score: 0,
    };
  }

  const domain = email.split("@")[1].toLowerCase();

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      component: "email",
      valid: false,
      reason: "Disposable email domains are not allowed",
      score: 0.3,
    };
  }

  return {
    component: "email",
    valid: true,
    reason: "Email format is valid and domain is not disposable",
    score: 1,
  };
}