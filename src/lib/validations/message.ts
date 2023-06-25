// import z from zod
import { z } from "zod";

export const messageValidator = z.object({
    message: z.string(),
    senderId: z.string(),
    receiverId: z.string(),
    text: z.string(),
    timestamp: z.number(),
// name: z.string(),
// image: z.string().url(),

})

export const messageArrayValidator = z.array(messageValidator)

export type Message = z.infer<typeof messageValidator>