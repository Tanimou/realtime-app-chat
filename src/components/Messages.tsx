"use client"

import { FC, useEffect, useRef,useState } from 'react'
import { Message } from '@/lib/validations/message'
import { cn, toPusherKey } from '@/lib/utils'
import { format } from 'date-fns'
import Image from 'next/image'
import { pusherClient } from '@/lib/pusher'
import { useRouter } from 'next/navigation'

interface MessagesProps {
  initialMessages: Message[]
    sessionId: string
    chatId: string
    sessionImg: string | null | undefined
    chatPartner: User
}

const Messages: FC<MessagesProps> = ({ initialMessages,sessionId,chatPartner, sessionImg, chatId }) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages)

        useEffect(() => {
        pusherClient.subscribe(toPusherKey(`chat:${chatId}`)) // Subscribe to the incoming_friend_requests channel on Pusher.

        const MessageHandler = (message:Message) => { // Define a handler function for the incoming_friend_requests event.
            setMessages((prev) => [message, ...prev]) // Add the new request to the friendRequests state.
            useRouter().refresh()
        } 

        pusherClient.bind('incoming_message', MessageHandler) // Bind the handler function to the incoming_message event.

        return () => { 
            pusherClient.unsubscribe(toPusherKey(`chat:${chatId}`)) // Unsubscribe from the incoming_message channel on Pusher.
            pusherClient.unbind('incoming_message', MessageHandler) // Unbind the handler function from the incoming_friend_requests event.
        }
        }, [chatId])
    
    const scrollDownRef = useRef<HTMLDivElement | null>(null)

    const formatTimeStamp = (timestamp: number) => {

        return format(timestamp,"HH:mm")
    }

    return <div id='messages' className='flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>
        <div ref={scrollDownRef} />
        {messages.map((message, index) => { 
            const isCurrentUser = message.senderId === sessionId
            const hasNextMessageFromSameUser = messages[index - 1]?.senderId === message.senderId
            return (
                <div
                    key={`${message.id}-${message.timestamp}`}
                    className='chat-message'
                >
                    <div className={cn('flex items-end',{'justify-end':isCurrentUser})}>
                        <div className={cn('flex flex-col space-y-2 text-base max-w-xs mx-2',{'order-1 items-end':isCurrentUser,'order-2 items-start':!isCurrentUser})}>
                            <span className={cn('px-4 py-2 rounded-lg inline-block', {
                                'bg-indigo-600 text-white': isCurrentUser,
                                'bg-gray-200 text-gray-900': !isCurrentUser,
                                'rounded-br-none': !hasNextMessageFromSameUser && isCurrentUser,
                                'rounded-bl-none': !hasNextMessageFromSameUser && !isCurrentUser,
                            })}>
                                {message.text}{' '}
                                <span className='ml-2 text-xs text-gray-400'>
                                    {formatTimeStamp(message.timestamp)}
                                </span>
                            </span>
                        </div>
                        <div
                            className={cn('relative w-6 h-6', {
                                'order-2': isCurrentUser,
                                'order-1': !isCurrentUser,
                                invisible: hasNextMessageFromSameUser,
                            })}>
                            <Image
                                fill
                                src={
                                    isCurrentUser ? (sessionImg as string) : chatPartner.image
                                }
                                alt='Profile picture'
                                referrerPolicy='no-referrer'
                                className='rounded-full'
                            />
                        </div>
                    </div>
                </div>
            )
        })}
  </div>
}

export default Messages