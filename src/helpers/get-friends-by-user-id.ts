//export a function called getFriendsByUserId that takes a userId as an argument of type string
// this function will first retrive all friends for the current user in the database using the fetchRedis function, and put it in a const friendIds as a string[]
//the fetcRedis function will use the 'smembers' command and the 'user:${userId}:friends' key to the fetchRedis function
//the function will then map over the array of friends(friendIds) to retrieve all information about each friend using the fetchRedis function again, in a const friends as an array of objects

import { fetchRedis } from "./redis";

/**
 * Retrieves all friends for a given user ID from the database.
 * @param userId The ID of the user to retrieve friends for.
 * @returns A Promise that resolves to an array of User objects representing the user's friends.
 */
export const getFriendsByUserId = async (userId: string) => {
    const friendIds = await fetchRedis("smembers", `user:${userId}:friends`) as string[]

    return await Promise.all(
            friendIds.map(async (friendId: string) => {
            return JSON.parse(await fetchRedis('get',`user:${friendId}`) as string) as User
            })
        );
    }