import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { database } from "./db";
import  GoogleProvider  from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    adapter: UpstashRedisAdapter(database),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/signin",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    callbacks: {
        async jwt({ token, user }) { 
            const dbUser = await database.get(`user:${token.id}`) as User | null
            if (!dbUser) {
                token.id = user!.id
                return token
            }
            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                image: dbUser.image,
            }
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture
            }
            return session
            
        },
        redirect() {
            return '/dashboard'
        }
    }
};