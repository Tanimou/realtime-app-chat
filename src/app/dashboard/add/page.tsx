/**
 * This file contains the page component for adding a friend in the dashboard section of the application.
 * It imports the AddFriendButton component and renders it along with a heading.
 */

import AddFriendButton from '@/components/AddFriendButton'
import { FC } from 'react'



const page: FC = () => {
    return <main className='pt-8'>
        <h1 className='font-bold text-5xl mb-8'>Add a friend</h1>
        <AddFriendButton/>
    </main>
}

export default page