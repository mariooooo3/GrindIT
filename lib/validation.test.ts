import { describe, it, expect } from "vitest";
import { isValidGitHubUsername, GITHUB_USERNAME_RE } from "@/lib/validation";

describe("isValidGitHubUsername", () => {
  it("accepts typical usernames", () => {
    for (const name of ["octocat", "a", "torvalds", "user-name", "a1-b2-c3", "Defunkt"]) {
      expect(isValidGitHubUsername(name)).toBe(true);
    }
  });
  it("accepts the 39-char maximum", () => {
    expect(isValidGitHubUsername("a".repeat(39))).toBe(true);
  });
  it("rejects empty, too-long, and bad hyphen placement", () => {
    for (const name of ["", "a".repeat(40), "-lead", "trail-", "double--hyphen"]) {
      expect(isValidGitHubUsername(name)).toBe(false);
    }
  });
  it("rejects path traversal and injection attempts", () => {
    for (const name of ["../user", "a/b", "a b", "a.b", "a_b", "user@x"]) {
      expect(isValidGitHubUsername(name)).toBe(false);
    }
  });
  it("exposes a stateless regex (no global flag)", () => {
    expect(GITHUB_USERNAME_RE.test("octocat")).toBe(true);
    expect(GITHUB_USERNAME_RE.test("octocat")).toBe(true);
  });
});
