// This file exports a React component called FriendRequestSidebarOption that displays a link to the user's friend requests page. 
// It also displays the number of unseen friend requests, 
// if any.The component takes in two props: initialUnseenRequestCount(the initial number of unseen friend requests) 
// and sessionId(the user's session ID).
"use client"

import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { User } from 'lucide-react'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'

interface FriendRequestSidebarOptionProps {
    initialUnseenRequestCount: number,
    sessionId: string
}

const FriendRequestSidebarOption: FC<FriendRequestSidebarOptionProps> = ({ initialUnseenRequestCount, sessionId }) => {
    const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
        initialUnseenRequestCount
    )

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`)) // Subscribe to the incoming_friend_requests channel on Pusher.

        const friendRequestsHandler = () => { // Define a handler function for the incoming_friend_requests event.
            setUnseenRequestCount((prev) => prev + 1) // Add the new request to the friendRequests state.
        }

        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`)) // Subscribe to the incoming_friend_requests channel on Pusher.

        const addedFriendHandler = () => {
            setUnseenRequestCount((prev) => prev - 1) // Add the new request to the friendRequests state.

        }

        pusherClient.bind('incoming_friend_requests', friendRequestsHandler) // Bind the handler function to the incoming_friend_requests event.
        pusherClient.bind('new_friend', addedFriendHandler) // Bind the handler function to the incoming_friend_requests event.

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incoming_friend_requests`)) // Unsubscribe from the incoming_friend_requests channel on Pusher.
            pusherClient.unbind('incoming_friend_requests', friendRequestsHandler) // Unbind the handler function from the incoming_friend_requests event.
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`)) // Unsubscribe from the incoming_friend_requests channel on Pusher.
            pusherClient.unbind('new_friend', addedFriendHandler) // Unbind the handler function from the incoming_friend_requests event.
        }
    }, [sessionId])

    return <Link href='/dashboard/requests' className='text-gray-700 hover:bg-gray-50 group hover:text-indigo-600 flex items-center gap-x-3 rounded-full p-2 text-sm leading-6 font-semibold'>
        <div className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
            <User className='w-4 h-4' />
        </div>
        <p className='truncate'>Friends request</p>
        {unseenRequestCount > 0 ? (
            <div className='rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600'>{unseenRequestCount}</div>
        ) : null}
    </Link>
}

export default FriendRequestSidebarOption