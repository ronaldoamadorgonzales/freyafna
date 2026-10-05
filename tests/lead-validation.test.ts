import { describe, it, expect } from "vitest";

function validateLeadRegistrationInput(input: {
  name?: string;
  email?: string;
  mobile?: string;
}) {
  const { name, email, mobile } = input;

  if (!name || !email || !mobile) {
    return { valid: false, error: "Full Name, Email Address, and Mobile Number are all strictly required." };
  }

  if (!email.includes("@") || !email.includes(".")) {
    return { valid: false, error: "Please enter a valid email address." };
  }

  const cleanMobile = mobile.replace(/[^0-9+]/g, "");
  if (cleanMobile.length < 7) {
    return { valid: false, error: "Please enter a valid mobile number." };
  }

  return { valid: true };
}

describe("Lead Registration Validation Rules", () => {
  it("passes when name, email, and mobile are all valid", () => {
    const res = validateLeadRegistrationInput({
      name: "Juan Dela Cruz",
      email: "juan.delacruz@gmail.com",
      mobile: "0917-123-4567",
    });

    expect(res.valid).toBe(true);
  });

  it("fails when mobile number is missing or empty", () => {
    const res = validateLeadRegistrationInput({
      name: "Juan Dela Cruz",
      email: "juan.delacruz@gmail.com",
      mobile: "",
    });

    expect(res.valid).toBe(false);
    expect(res.error).toContain("Mobile Number are all strictly required");
  });

  it("fails when mobile number has fewer than 7 digits", () => {
    const res = validateLeadRegistrationInput({
      name: "Juan Dela Cruz",
      email: "juan.delacruz@gmail.com",
      mobile: "12345",
    });

    expect(res.valid).toBe(false);
    expect(res.error).toContain("valid mobile number");
  });

  it("fails when email format is invalid", () => {
    const res = validateLeadRegistrationInput({
      name: "Juan Dela Cruz",
      email: "not-an-email",
      mobile: "0917-123-4567",
    });

    expect(res.valid).toBe(false);
    expect(res.error).toContain("valid email address");
  });
});
