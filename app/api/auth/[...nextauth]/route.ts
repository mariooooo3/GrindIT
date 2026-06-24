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
  pages: {
    signIn: "/",
  },
});

export { handler as GET, handler as POST };
