import { Channel } from "../types/Channel";
import { User } from "../types/User";

export interface DisplayMessage{
    user:User;
    topic:Channel;
    message:string;
}