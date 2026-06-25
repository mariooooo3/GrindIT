// Shared input validation.

/**
 * GitHub usernames: 1–39 chars, alphanumeric with single internal hyphens only
 * (no leading/trailing hyphen, no double hyphen). Rejecting anything else also
 * kills path traversal (e.g. `../user`) and URL injection into GitHub API calls.
 */
export const GITHUB_USERNAME_RE = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

export function isValidGitHubUsername(value: string): boolean {
  return GITHUB_USERNAME_RE.test(value);
}
