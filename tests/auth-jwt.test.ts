import { describe, it, expect } from "vitest";
import { 
  createInsightsToken, 
  verifyInsightsToken, 
  encryptSession, 
  decryptSession 
} from "@/lib/auth-jwt";

describe("48-Hour Insights Security Tokens", () => {
  it("creates and verifies a valid 48-hour insights token", async () => {
    const leadId = "test-lead-uuid-1234";
    const advisorCode = "ARTHUR";

    const token = await createInsightsToken(leadId, advisorCode, 48);
    expect(typeof token).toBe("string");
    expect(token).toContain("-");

    const { payload, isExpired } = await verifyInsightsToken(token);
    expect(isExpired).toBe(false);
    expect(payload).not.toBeNull();
    expect(payload?.leadId).toBe(leadId);
    expect(payload?.advisorCode).toBe(advisorCode);
    expect(payload?.expiresAt).toBeGreaterThan(Date.now());
  });

  it("identifies expired tokens when expiration duration is 0 or negative", async () => {
    const leadId = "test-expired-lead";
    // Token with -1 hours expiration (expired 1 hour ago)
    const token = await createInsightsToken(leadId, undefined, -1);

    const { payload, isExpired } = await verifyInsightsToken(token);
    expect(isExpired).toBe(true);
    expect(payload?.leadId).toBe(leadId);
  });

  it("rejects corrupted or tampered tokens safely without throwing errors", async () => {
    const corruptedToken = "invalid_token_string_12345";
    const { payload, isExpired } = await verifyInsightsToken(corruptedToken);

    expect(payload).toBeNull();
    expect(isExpired).toBe(true);
  });
});

describe("Advisor Session Encryption & Decryption", () => {
  it("encrypts and decrypts advisor session payloads properly", async () => {
    const sessionInput = {
      id: "advisor-uuid-123",
      email: "ronald@sunlife.com.ph",
      fullName: "Ronald Gonzales",
      role: "ADMIN" as const,
      advisorCode: "098189",
      isDefault: true,
      createdAt: Date.now(),
    };

    const encrypted = await encryptSession(sessionInput);
    expect(typeof encrypted).toBe("string");
    expect(encrypted).toContain(":");

    const decrypted = await decryptSession(encrypted);
    expect(decrypted).not.toBeNull();
    expect(decrypted?.email).toBe(sessionInput.email);
    expect(decrypted?.role).toBe("ADMIN");
    expect(decrypted?.advisorCode).toBe("098189");
  });

  it("returns null when decrypting invalid or manipulated session cookie", async () => {
    const result = await decryptSession("fake:session_cookie_string");
    expect(result).toBeNull();
  });
});
