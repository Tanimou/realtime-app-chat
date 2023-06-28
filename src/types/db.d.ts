interface User {
    id: string;
    name: string;
    email: string;
    image: string;

}

interface ExtendedUser extends User{
    isOnline:boolean
}
interface Chat{
    id: string
    messages: Message[]
}

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    timestamp: number;
    text:string

}

interface FriendRequest{
    id: string;
    senderId: string;
    receiverId: string;
}