import type { ValidatorResult } from "./index";

export function validatePassword(password: string): ValidatorResult {
  const checks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasDigit: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const score = passed / 5;

  if (score < 0.4) {
    return {
      component: "password",
      valid: false,
      reason: "Password is too weak. Use at least 8 characters with upper, lower, digit, and special.",
      score,
    };
  }

  if (score < 0.8) {
    return {
      component: "password",
      valid: true,
      reason: "Password strength is fair, consider adding more variety",
      score,
    };
  }

  return {
    component: "password",
    valid: true,
    reason: "Password is strong",
    score,
  };
}