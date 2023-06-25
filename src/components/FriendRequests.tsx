// This file contains the FriendRequests component, which displays a list of incoming friend requests.
// It allows the user to accept or deny each request, and updates the list accordingly.
"use client"

import { X } from 'lucide-react'
import { Check, UserPlus } from 'lucide-react'
import { FC, useState } from 'react'
import Image from 'next/image'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface FriendRequestsProps {
    incomingFriendRequests: IncomingFriendRequest[]
    sessionId: string
}

const FriendRequests: FC<FriendRequestsProps> = ({ incomingFriendRequests, sessionId }) => {
    const router= useRouter()
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(
        incomingFriendRequests
    )

    // This function accepts a friend request by sending a POST request to the server with the senderId.
    // It then updates the friendRequests state by removing the request with the given senderId and refreshes the page.
    const acceptFriend= async (senderId:string)=>{
        await axios.post('/api/requests/accept', { id: senderId })
        setFriendRequests((prev) => prev.filter((request) => request.senderId !== senderId))
        router.refresh()
    }

    // This function denies a friend request by sending a POST request to the server with the senderId.
    // It then updates the friendRequests state by removing the request with the given senderId and refreshes the page.
    const denyFriend= async (senderId:string)=>{
        await axios.post('/api/requests/deny', { id: senderId })
        setFriendRequests((prev) => prev.filter((request) => request.senderId !== senderId))
        router.refresh()
    }

    return <>
        {friendRequests.length === 0 ? (
            <p className='text-sm text-zinc-500'>Nothing to show here</p>
        ) : (
            friendRequests.map((request) => (
                <div key={request.senderId} className='flex gap-4 items-center'>
                    <UserPlus className='text-black' />
                    <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                        <li className='-mx-6 mt-auto flex items-center'>
                            <div className='flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900'>
                                <div className='relative h-8 w-8 bg-gray-50'>
                                    <Image
                                        fill
                                        referrerPolicy='no-referrer'
                                        className='rounded-full'
                                        src={request.senderImage || ''}
                                        alt=''
                                    />
                                </div>
                                <div className='flex flex-col'>
                                    <span aria-hidden='true'>{request.senderName}</span>
                                    <span className='text-xs text-zinc-400' aria-hidden='true'>{request.senderEmail}</span>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <button aria-label="accept friend" className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md ' onClick={() => acceptFriend(request.senderId)}>
                        <Check className='font-semibold text-white w-3/4 h-3/4' />
                    </button>
                    <button aria-label="deny friend" className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md ' onClick={() => denyFriend(request.senderId)}>
                        <X className='font-semibold text-white w-3/4 h-3/4' />
                    </button>

                </div>
            ))
        )}
    </>
}

export default FriendRequests