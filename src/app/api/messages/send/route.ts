import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { database } from "@/lib/db"
import { getServerSession } from "next-auth"
import { Message, messageValidator } from "@/lib/validations/message"
import { nanoid } from "nanoid"

export async function POST(req:Request) {
    try {
        const {text,chatId}:{text:string,chatId:string} = await req.json()
        const session = await getServerSession(authOptions)

        if (!session) {
          return new Response("Unauthorized", {status: 401})
        }

        const [userId1,userId2] = chatId.split("--")

        if(userId1 !== session.user.id && userId2 !== session.user.id){
            return new Response("Unauthorized", {status: 401})
        }

        const friendId = userId1 === session.user.id ? userId2 : userId1

        const friendList = await fetchRedis('smembers', `user:${session.user.id}:friends`) as string[]
        
        const isFriend = friendList.includes(friendId)
        if (!isFriend) {
            return new Response("Unauthorized", {status: 401})
        }

        const rawSender = await fetchRedis('get', `user:${session.user.id}`) as string
        const sender = JSON.parse(rawSender) as User
        const timestamp = Date.now()

        const messageData: Message = {
            id: nanoid(),
            text,
            senderId: session.user.id,
            timestamp,
            receiverId: friendId,
            
        }

        const message = messageValidator.parse(messageData)

        await database.zadd(`chat:${chatId}:messages`, {
            score: timestamp,
            member: JSON.stringify(message)
        })

        return new Response("OK", {status: 200})
    } catch (error) {
        if(error instanceof Error){
            return new Response(error.message, {status: 500})
        }
        return new Response("Internal Server Error", {status: 500})
    }
}