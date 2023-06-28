"use client"

import { chatHrefConstructor, toPusherKey } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import Image from 'next/image'
import { pusherClient } from '@/lib/pusher'
import toast from 'react-hot-toast'
import UnseenChatToast from './UnseenChatToast'



interface SidebarChatListProps {
    friends: ExtendedUser[]
    sessionId: string
}
interface ExtendedMessage extends Message{
    senderImg:string
    senderName:string
}



/**
 * SidebarChatList component that displays a list of friends and their unseen messages.
 * @param {SidebarChatListProps} friends - An array of User objects representing the user's friends.
 * @returns {JSX.Element} - A JSX element representing the SidebarChatList component.
 */
const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }: SidebarChatListProps): JSX.Element => {
    const router = useRouter()
    const pathName = usePathname()
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
    const [activeChats, setActiveChats] = useState<ExtendedUser[]>(friends)

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`))
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        const newFriendHandler = (newFriend:ExtendedUser) => {
            setActiveChats((prev)=>[...prev,newFriend])
        }
        
        const chatHandler = (message:ExtendedMessage) => { 
            const shouldNotify = pathName !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`
            if (!shouldNotify) return
            toast.custom((t) => (
                <UnseenChatToast
                    t={t}
                    sessionId={sessionId}
                    senderId={message.senderId}
                    senderImg={message.senderImg}
                    senderName={message.senderName}
                    senderMessage={message.text}
                />
            ))
            setUnseenMessages((prev)=>[...prev,message])
        }

        pusherClient.bind('new_message',chatHandler)
        pusherClient.bind('new_friend',newFriendHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`))
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))
            pusherClient.unbind('new_message', chatHandler)
            pusherClient.unbind('new_friend', newFriendHandler)
        }

    }, [sessionId,router,pathName])


    useEffect(() => {
        if (pathName?.includes('chat')) {
            setUnseenMessages((prev) => {
                return prev.filter((message) => !pathName.includes(message.senderId))
            })
        }


    }, [pathName])

    return (<ul role="list" className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
        {activeChats.sort().map((friend) => {
            friend.isOnline=true
            const unseenMessagesCount = unseenMessages.filter((message) => message.senderId === friend.id).length
            return <li key={friend.id}>
                <a href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`} className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 flex group items-center gap-x-3 rounded-full p-2 text-sm leading-6 font-semibold'>
                    {/* {friend.name} */}

                    <div className='relative h-8 w-8 bg-gray-50'>
                        <Image
                            fill
                            referrerPolicy='no-referrer'
                            className='rounded-full'
                            src={friend.image || ''}
                            alt=''
                        />
                    </div>
                    <div className='flex flex-col'>
                        <span aria-hidden='true'>{friend.name}</span>
                    </div>
                    {friend.isOnline ? (
                        <span className='h-2 w-2 relative'>
                            <span className='absolute top-0 left-0 h-2 w-2 bg-green-500 rounded-full animate-ping'></span>
                            <span className='absolute top-0 left-0 h-2 w-2 bg-green-500 rounded-full animate-pulse'></span>
                        </span>
                
                    ) : (
                        <span className='h-2 w-2 bg-red-500 rounded-full animate-pulse'></span>
                    )}
                    {unseenMessagesCount > 0 && (
                        <div className='bg-indigo-600 fint-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center'>
                            {unseenMessagesCount}
                        </div>
                    )}
                </a>
            </li>
        })}
    </ul>)
}

export default SidebarChatList