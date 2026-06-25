import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          // read:user — public profile. repo — required to include the user's own
          // PRIVATE repos/commits in their Wrapped (lib/github.ts fetches
          // /user/repos?affiliation=owner + private commit messages). read:org is
          // intentionally NOT requested: no org/membership data is fetched anywhere.
          scope: "read:user repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.login = (profile as { login?: string }).login;
      }
      return token;
    },
    async session({ session, token }) {
      // Do NOT expose the OAuth access token to the browser. It stays in the
      // encrypted JWT and is read server-side only (see app/api/github).
      session.login = token.login as string | undefined;
      return session;
    },
  },
  events: {
    // Clearing the session cookie does NOT invalidate the GitHub token — classic
    // OAuth App tokens often never expire on their own, so a logged-out token
    // would stay live at GitHub with full `repo` scope (private repos). On
    // sign-out we proactively revoke it via GitHub's token-revocation endpoint
    // (P1-15). Best-effort: a failure here must never block logout.
    async signOut({ token }) {
      const accessToken = (token as { accessToken?: string }).accessToken;
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      if (!accessToken || !clientId || !clientSecret) return;
      try {
        await fetch(`https://api.github.com/applications/${clientId}/token`, {
          method: "DELETE",
          headers: {
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ access_token: accessToken }),
        });
      } catch (err) {
        console.error("[auth] token revocation on signOut failed:", err);
      }
    },
  },
  pages: {
    signIn: "/",
  },
});

export { handler as GET, handler as POST };
