import { Channel } from "../Domain/Channel";
import { User } from "../Domain/User";

export interface DisplayMessage{
    user:User;
    topic:Channel;
    message:string;
}