"use client"

import { FC, useRef,useState } from 'react'
import  TextareaAutosize  from 'react-textarea-autosize'
import Button from './ui/Button'
import { Icons } from './icons'
import { set } from 'zod'
import axios from 'axios'
import { toast } from 'react-hot-toast'
interface ChatInputProps {
  chatId: string
}

const ChatInput: FC<ChatInputProps> = ({ chatId}) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const [input, setInput] = useState<string | undefined>('' as string | undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const sendMessage = async () => {
        if(!input) return
        setIsLoading(true)
        try {
            await axios.post('/api/messages/send', { text: input, chatId })
            setInput('')
            textareaRef.current?.focus()
        } catch {
            toast.error('Something went wrong sending your message')
        } finally {
            setIsLoading(false)
        }
        
    }

    return <div className='border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0'>
        <div className='relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600'>
            <TextareaAutosize ref={textareaRef} onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                }
            }}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message"
                className='block w-full resize-none bg-transparent px-4 py-3 sm:py-1.5 sm:text-sm sm:leading-6 text-gray-900 placeholder-gray-500 border-0 focus:outline-none focus:ring-0 focus:placeholder-gray-400'
            />
            <div
                onClick={() => textareaRef.current?.focus()}
                className='py-2'
                aria-hidden="true"
                
            >
                <div className='py-px'>
                    <div className='h-9'/>
                </div>
            </div>
            <div className='absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
                <div className='flex-shrink-0'>
                    <Button isLoading={isLoading} variant={'ghost'} onClick={sendMessage} type='submit'><Icons.Logo className="h-5 w-5 text-indigo-600" /></Button>
                </div>
            </div>
      </div>
  </div>
}

export default ChatInput