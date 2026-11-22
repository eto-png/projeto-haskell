import { describe, expect, it } from "vitest";
import { hasAccess } from "./access";

const now = new Date("2026-10-14T12:00:00Z");

describe("dashboard access", () => {
  it("allows active subscribers even after trial", () => {
    expect(hasAccess({ plan_id: "pro", subscription_active: true, trial_ends_at: "2026-01-01T00:00:00Z" }, now)).toBe(true);
  });
  it("allows users inside the 7-day trial", () => {
    expect(hasAccess({ plan_id: "trial", subscription_active: false, trial_ends_at: "2026-10-20T00:00:00Z" }, now)).toBe(true);
  });
  it("blocks expired trial without subscription", () => {
    expect(hasAccess({ plan_id: "trial", subscription_active: false, trial_ends_at: "2026-10-13T00:00:00Z" }, now)).toBe(false);
  });
  it("blocks users with no subscription row", () => {
    expect(hasAccess(null, now)).toBe(false);
  });
});
