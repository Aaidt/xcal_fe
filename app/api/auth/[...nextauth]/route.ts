import { prisma } from "@/prisma/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"


const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    //
    // CredentialsProvider({
    //   name: "credentials",
    //   credentials: {
    //     email: { label: 'Email', type: 'email' },
    //     password: { label: 'Password', type: 'password' },
    //   },
    //   async authorize(credentials) {
    //     if (!credentials?.email || !credentials?.password) {
    //       throw new Error('Email and password are required.')
    //     }
    //     const user = await prisma.user.findUnique({
    //       where: { email: credentials.email },
    //     })
    //
    //     if (!user) {
    //       throw new Error('Invalid email or password.')
    //     }
    //
    //     const isPasswordValid = bcrypt.compare(credentials.password!, user.password!)
    //     if (!isPasswordValid) {
    //       throw new Error('Invalid email or password.')
    //     }
    //
    //     return { id: user.id, email: user.email, Name: user.name }
    //   },
    // }),
  ],

  session: {
    strategy: "jwt"
  },
  // pages: {
  //   signIn: "/auth/signin"
  // },
  callbacks: {
    // @ts-ignore
    jwt: ({ token, user }) => {
      if (user) token.id = user.id
      return token
    },
    // @ts-ignore
    session: ({ session, token }) => {
      session.user.id = token.id
      return session
    }
  }
})

export { handler as GET, handler as POST }

