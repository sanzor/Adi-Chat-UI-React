import { Channel } from "../Domain/Channel";
import { ChatMessageDto } from "./SocketCommandResults/ChatMessageDto";

export interface ChannelWithMessagesDto{
    channel:Channel;
    messages:[ChatMessageDto];
}