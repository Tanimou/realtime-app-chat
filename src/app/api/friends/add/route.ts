// This file exports a POST request handler function that adds a friend to a user's friend list in Redis.
// It validates the request body, checks if the user is authorized, and checks if the user is already friends with the requested friend.
// Importing necessary modules and functions
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { database } from "@/lib/db";
import { addFriendValidator } from "@/lib/validations/add-friends";
import { getServerSession } from "next-auth";
import { z } from "zod";

// Defining the POST request handler function
export async function POST(req: Request) {
  try {
    // Parsing the request body to JSON
    const body = await req.json();
    // Extracting the email from the request body and validating it using the addFriendValidator schema
    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    // Fetching the user ID associated with the email from Redis
    const idToAdd = await fetchRedis('get',`user:email:${emailToAdd}`) as string
    // If the user ID is not found, return a 400 Bad Request response
    if (!idToAdd) {
      return new Response("This person doesn't not exist", { status: 400 });
    }

    // Retrieving the session object from Next.js server
    const session = await getServerSession(authOptions);
    // If the session object is not found, return a 401 Unauthorized response
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // If the user tries to add themselves as a friend, return a 400 Bad Request response
    if (idToAdd === session.user.id) {
      return new Response("You cannot add yourself as a friend", {
        status: 400,
      });
    }

    // Checking if the user has already sent a friend request to the user they are trying to add
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;

    // If the user has already sent a friend request, return a 400 Bad Request response
    if (isAlreadyAdded) {
      return new Response("Already added this user", { status: 400 });
    }

    // Checking if the users are already friends
    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;

    // If the users are already friends, return a 400 Bad Request response
    if (isAlreadyFriends) {
      return new Response("Already friends", { status: 400 });
    }

    // Adding the friend request to the user's incoming friend requests set in Redis
    database.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);
  
    // Return a 200 OK response with a success message
    return new Response("Nice");
  } catch (error) { 
    // If there is an error, check if it is a Zod validation error
    if (error instanceof z.ZodError) {
      // If it is a validation error, return a 422 Unprocessable Entity response
      return new Response('Invalid request payload',{status:422})
    }
    // If it is not a validation error, return a 400 Bad Request response
    return new Response('Invalid request', { status: 400 })
  }
}
