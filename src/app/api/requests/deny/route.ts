// This module exports a function that handles a POST request to deny a friend request and returns appropriate response status codes. It parses the request body, checks for authentication, removes the friend request from the user's incoming friend requests set, and returns a response with the appropriate status code. If there is an error, it returns a response with an appropriate error status code.

// Imports necessary modules and functions for the route
// Handles POST request to deny a friend request and returns appropriate response status codes
import { fetchRedis } from "@/helpers/redis" // Importing fetchRedis function from redis helper module
import { authOptions } from "@/lib/auth" // Importing authOptions object from auth module
import { database } from "@/lib/db" // Importing database object from db module
import { getServerSession } from "next-auth" // Importing getServerSession function from next-auth module
import { z } from "zod" // Importing z object from zod module

export async function POST(req: Request) { // Exporting an async function named POST that takes in a Request object as a parameter
    try { // Start of try block
        const body = await req.json() // Parsing the request body as JSON
        const { id: idToDeny } = z.object({ id: z.string() }).parse(body) // Parsing the id property from the request body using zod
        const session = await getServerSession(authOptions) // Getting the server session using authOptions
        if (!session) { // If there is no session
            return new Response('Unauthorized', { status: 401 }) // Return a response with status code 401
        }

        await database.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny) // Remove the friend request from the user's incoming friend requests set
        // await database.srem(`user:${idToDeny}:outgoing_friend_requests`, session.user.id)
        return new Response('ok', { status: 200 }) // Return a response with status code 200
    } catch (error) { // If there is an error
        if (error instanceof z.ZodError) { // If the error is a zod error
            return new Response('Invalid request payload', { status: 422 }) // Return a response with status code 422
        }
        return new Response('Internal server error', { status: 400 }) // Return a response with status code 400
    }
}