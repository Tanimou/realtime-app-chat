// import z from zod
import { z } from "zod";

export const addFriendValidator = z.object({
    email: z.string().email(),
    // name: z.string(),
    // image: z.string().url(),

})