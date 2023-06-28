// This code exports a POST request handler function that accepts a request object as its parameter, parses the request body, and extracts the idToAdd value. It then checks if the user is authorized, if they are already friends with the requested user, or if they have a friend request from the requested user. If none of these conditions are met, it adds the requested user to the user's friend list and vice versa, removes the friend request from the user's incoming friend requests list, and returns a success response. If there is a ZodError, it returns an invalid request payload response, and if there is any other error, it returns an internal server error response.
// Import necessary modules and functions
// Define a POST request handler function that accepts a request object as its parameter
// Parse the request body and extract the idToAdd value
// Get the user session using the authOptions object
// If there is no session, return an unauthorized response
// Check if the user is already friends with the requested user
// If they are already friends, return a bad request response
// Check if the user has a friend request from the requested user
// If they don't have a friend request, return a bad request response
// Add the requested user to the user's friend list and vice versa
// Remove the friend request from the user's incoming friend requests list
// Return a success response
// If there is a ZodError, return an invalid request payload response
// If there is any other error, return an internal server error response
import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { database } from "@/lib/db"
import { pusherServer } from "@/lib/pusher"
import { toPusherKey } from "@/lib/utils"
import { getServerSession } from "next-auth"
import {z} from "zod"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { id: idToAdd } = z.object({ id: z.string() }).parse(body)
        const session = await getServerSession(authOptions)
        if(!session){
            return new Response('Unauthorized',{status:401})
        }

        const isAlreadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd)
        if (isAlreadyFriends) {
            return new Response('Already friends', { status: 400 })
        }
        const hasFriendRequest = await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_requests`, idToAdd)
        if (!hasFriendRequest) {
            return new Response('No friends requests', { status: 400 })
        }

        const [userRaw, friendRaw] = (await Promise.all([
            fetchRedis('get',`user:${session.user.id}`),
            fetchRedis('get',`user:${idToAdd}`)
        ])) as [string, string]
        
        const user = JSON.parse(userRaw) as ExtendedUser
        const friend = JSON.parse(friendRaw) as ExtendedUser

        await Promise.all([
            pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`),'new_friend',user),
            pusherServer.trigger(toPusherKey(`user:${session.user.id}:friends`),'new_friend',friend),
            database.sadd(`user:${session.user.id}:friends`, idToAdd),
            database.sadd(`user:${idToAdd}:friends`, session.user.id),
            database.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd),

        ])

        
        // await database.srem(`user:${idToAdd}:outgoing_friend_requests`, session.user.id)
        return new Response('ok', { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request payload', { status: 422 })
        }
        return new Response('Internal server error', { status: 400 })
    }
}