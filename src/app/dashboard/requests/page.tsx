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
            const sender = await fetchRedis('get', `user:${senderId}`) as User
            return { senderId, senderEmail: sender.email }
        })
    )
    return <main className='pt-8'>
        <h1 className='font-bold text-5xl mb-8'>Add a friend</h1>
        
    </main>
}

export default page