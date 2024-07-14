import { GetServerSideProps, type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook"

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id: string;
      roles: [];
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        callbackUrl: {}
      },
      async authorize(credentials, req) {
        // console.log('authorize',req, message)
        const res = await fetch(`${process.env.NEXTAUTH_REDIS}/api/${credentials}/redis`)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const user = await res.json()
        if (res.ok && user) {
          console.log("success");
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return user;
        }
        return null;
      },
    }),
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET
    // }),
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    // }),
  ],
  callbacks: {
    // async signIn({ account, profile }) {
    //   if (account.provider === "google") {
    //     return profile.email_verified && profile.email.endsWith("@example.com")
    //   }else if (account.provider === "facebook") {
    //     return profile.email_verified && profile.email.endsWith("@example.com")
    //   }
    //   return true // Do different verification for other providers that don't have `email_verified`
    // },
    jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
    redirect({ baseUrl }) {
      return baseUrl
    },
    session({ session, token }) {
      return {
        ...session,
        user: token.user as { name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; } | undefined
      };
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // 2 hours
    updateAge: 2 * 60 * 60, // 2 hours
  },
  // pages: {
  //   signIn: "/auth/signin",
  //   error: "/auth/error"
  // }
};


/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
