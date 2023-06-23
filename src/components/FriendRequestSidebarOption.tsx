"use client"

import { User } from 'lucide-react'
import Link from 'next/link'
import { FC,useState } from 'react'

interface FriendRequestSidebarOptionProps {
    initialUnseenRequestCount: number,
    sessionId:string
}

const FriendRequestSidebarOption: FC<FriendRequestSidebarOptionProps> = ({ initialUnseenRequestCount,sessionId }) => {
    const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
        initialUnseenRequestCount
    )

    return <Link href='/dashboard/requests' className='text-gray-700 hover:bg-gray-50 group hover:text-indigo-600 flex items-center gap-x-3 rounded-full p-2 text-sm leading-6 font-semibold'>
        <div className='text-gray-400 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
            <User className='w-4 h-4'/>
        </div>
        <p className='truncate'>Friends request</p>
        {unseenRequestCount > 0 ? (
            <div className='rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600'>{unseenRequestCount}</div>
        ): null}
  </Link>
}

export default FriendRequestSidebarOption