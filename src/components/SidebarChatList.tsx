"use client"

import { chatHrefConstructor } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import Image from 'next/image'

interface SidebarChatListProps {
    friends: User[]
    sessionId:string
}

/**
 * SidebarChatList component that displays a list of friends and their unseen messages.
 * @param {SidebarChatListProps} friends - An array of User objects representing the user's friends.
 * @returns {JSX.Element} - A JSX element representing the SidebarChatList component.
 */
const SidebarChatList: FC<SidebarChatListProps> = ({ friends,sessionId }: SidebarChatListProps): JSX.Element => {
    const router = useRouter()
    const pathName = usePathname()
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])

    useEffect(() => {
        if (pathName?.includes('chat')) { 
            setUnseenMessages((prev) => { 
                return prev.filter((message) => !pathName.includes(message.senderId) )
            })
        }

    
    }, [pathName])

    return (<ul role="list" className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
        {friends.sort().map((friend) => {
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