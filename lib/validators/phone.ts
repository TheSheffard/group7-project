import { ValidatorResult } from "./index";

const NIGERIAN_CARRIERS: Record<string, string> = {
  "0803": "MTN", "0806": "MTN", "0703": "MTN", "0706": "MTN",
  "0813": "MTN", "0816": "MTN", "0810": "MTN", "0903": "MTN", "0906": "MTN",
  "0805": "Glo", "0807": "Glo", "0705": "Glo", "0815": "Glo",
  "0811": "Glo", "0905": "Glo", "0915": "Glo",
  "0802": "Airtel", "0808": "Airtel", "0708": "Airtel", "0812": "Airtel",
  "0701": "Airtel", "0902": "Airtel", "0901": "Airtel",
  "0809": "9mobile", "0818": "9mobile", "0817": "9mobile",
  "0909": "9mobile", "0908": "9mobile",
};

export function validatePhone(phone: string): ValidatorResult {
  // Strip spaces and dashes
  const cleaned = phone.replace(/[\s\-()]/g, "");

  // Accept with or without +234
  let nationalNumber: string;
  let includedCountryCode = true;

  if (cleaned.startsWith("+234")) {
    nationalNumber = "0" + cleaned.slice(4);
  } else if (cleaned.startsWith("234")) {
    nationalNumber = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("0")) {
    nationalNumber = cleaned;
    includedCountryCode = false;
  } else {
    return {
      component: "phone",
      valid: false,
      reason: "Phone must start with 0 or +234",
      score: 0,
    };
  }

  // Must be exactly 11 digits starting with 0
  if (!/^0\d{10}$/.test(nationalNumber)) {
    return {
      component: "phone",
      valid: false,
      reason: "Phone number must be 11 digits (0XXXXXXXXXX)",
      score: 0,
    };
  }

  const prefix = nationalNumber.slice(0, 4);
  const carrier = NIGERIAN_CARRIERS[prefix];

  if (!carrier) {
    return {
      component: "phone",
      valid: false,
      reason: "Unknown Nigerian carrier prefix",
      score: 0.2,
    };
  }

  return {
    component: "phone",
    valid: true,
    reason: `Valid Nigerian ${carrier} number`,
    score: 1,
    ...(includedCountryCode ? { details: { carrier, nationalNumber } } : { details: { carrier, nationalNumber } }),
  };
}