// "use client"

import { fetchRedis } from '@/helpers/redis'
// import { Message } from '@/lib/validations/message'
import { messageArrayValidator } from '@/lib/validations/message'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Messages from '@/components/Messages'
import ChatInput from '@/components/ChatInput'
import { authOptions } from '@/lib/auth'
// import { useEffect } from 'react'
// import { pusherClient } from '@/lib/pusher'
// import { toPusherKey } from '@/lib/utils'

interface pageProps {
  params: {
    chatId: string
  }
}




async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1)
    const dbMessgaes = results.map((message) => JSON.parse(message) as Message)
    const reverserDbMessages = dbMessgaes.reverse()


    return messageArrayValidator.parse(reverserDbMessages)
  } catch (error) {
    console.error(error)
    notFound()
  }
}

const Page = async ({ params }: pageProps) => {
  const { chatId } = params
  const session = await getServerSession(authOptions)
  if (!session) notFound()

  const { user } = session

  const [userId1, userId2] = chatId.split('--')

  if (user.id !== userId1 && user.id !== userId2) {
    notFound()
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1
  const chatPartnerRaw = (await fetchRedis(
    'get',
    `user:${chatPartnerId}`
  )) as string
  const chatPartner = JSON.parse(chatPartnerRaw) as ExtendedUser
  const initialMessages = await getChatMessages(chatId)
  chatPartner.isOnline = true 
  // useEffect(() => {
  //   pusherClient.subscribe(toPusherKey(`user:${chatId}:presence_channel`)) 
  //   const setChatPartner = (chatPartner:User) => { 
  //   chatPartner.isOnline = true
  //   } 
  //   pusherClient.bind("pusher:subscription_succeeded", setChatPartner);

    
  // }, [chatId])
  

  return <div className='flex-1 justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]'>
    <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
      <div className='relative flex items-center space-x-4'>
        <div className='relative'>
          <div className='relative w-8 sm:w-12 h-8 sm:h-12'>
            <Image
              fill
              referrerPolicy='no-referrer'
              src={chatPartner.image}
              alt={`${chatPartner.name}'s profile picture`}
              className='rounded-full'
            />
          </div>
        </div>
        <div className='flex flex-col leading-tight'>
          <div className='text-xl flex items-center'>
            <span className='text-gray-700 mr-3 font-semibold'>{chatPartner.name} </span>
            {chatPartner.isOnline ? (
            <span className='h-2 w-2 relative'>
              <span className='absolute top-0 left-0 h-2 w-2 bg-green-500 rounded-full animate-ping'></span>
              <span className='absolute top-0 left-0 h-2 w-2 bg-green-500 rounded-full animate-pulse'></span>
            </span>
          ) : (
            <span className='h-2 w-2 bg-red-500 rounded-full animate-pulse'></span>
          )}
          </div>
          <span className='text-sm text-gray-600'>{chatPartner.email} </span>
        </div>
      </div>
    </div>
    <Messages
      initialMessages={initialMessages}
      sessionImg={session.user.image}
      sessionId={session.user.id}
      chatPartner={chatPartner}
      chatId={ chatId} />
    <ChatInput chatId={chatId} />
  </div>
}

export default Page