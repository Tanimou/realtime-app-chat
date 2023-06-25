// This file exports a NextAuthOptions object that defines the authentication options for the application.
// It uses UpstashRedisAdapter as the adapter, JWT as the session strategy, and GoogleProvider as the authentication provider.
// It also defines callbacks for JWT, session, and redirect.
// The file also imports the database from./ db and fetchRedis from "@/helpers/redis".

// Importing NextAuthOptions from next-auth
import { NextAuthOptions } from "next-auth";

// Importing UpstashRedisAdapter from @next-auth/upstash-redis-adapter
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";

// Importing the database from ./db
import { database } from "./db";

// Importing GoogleProvider from next-auth/providers/google
import  GoogleProvider  from "next-auth/providers/google";

// Importing fetchRedis from "@/helpers/redis"
import { fetchRedis } from "@/helpers/redis";

// Defining authOptions as a NextAuthOptions object
export const authOptions: NextAuthOptions = {
    // Using UpstashRedisAdapter as the adapter
    adapter: UpstashRedisAdapter(database),

    // Using JWT as the session strategy
    session: {
        strategy: "jwt",
    },

    // Defining the signIn page
    pages: {
        signIn: "/auth/signin",
    },

    // Defining the Google provider
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],

    // Defining the callbacks
    callbacks: {
        // Defining the jwt callback
        async jwt({ token, user }) { 
            // Fetching the user from Redis
            const dbUserResult = await fetchRedis('get', `user:${token.id}`) as string | null

            // If the user is not found in Redis, return the token
            if (!dbUserResult) {
                token.id = user!.id
                return token
            }

            // If the user is found in Redis, return the user object
            const dbUser= JSON.parse(dbUserResult) as User
            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                image: dbUser.image,
            }
        },

        // Defining the session callback
        async session({ session, token }) {
            // If the token exists, set the user properties in the session
            if (token) {
                session.user.id = token.id
                session.user.name = token.name
                session.user.email = token.email
                session.user.image = token.picture
            }
            return session
            
        },

        // Defining the redirect callback
        redirect() {
            return '/dashboard'
        }
    }
};