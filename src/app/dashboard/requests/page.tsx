// This file exports a Next.js page component that displays a list of incoming friend requests for the logged-in user.
// It fetches the list of incoming friend requests from Redis using the user's session ID, and then renders the FriendRequests component with the list of requests.
import FriendRequests from '@/components/FriendRequests'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'




const page = async () => {
    const session = await getServerSession(authOptions)
    if (!session) notFound()
    const incomingSenderIds = await fetchRedis('smembers', `user:${session.user.id}:incoming_friend_requests`) as string[]

    const incomingFriendRequests = await Promise.all(
        incomingSenderIds.map(async (senderId) => {
            const sender = await fetchRedis('get', `user:${senderId}`) as string
            const senderParsed= JSON.parse(sender) as User
            return { senderId, senderEmail: senderParsed.email, senderName: senderParsed.name, senderImage:senderParsed.image }
        })
    )
    return <main className='pt-8'>
        <h1 className='font-bold text-5xl mb-8'>Add a friend</h1>
        <FriendRequests incomingFriendRequests={incomingFriendRequests} sessionId={session.user.id} />
    </main>
}

export default page