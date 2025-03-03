import { Channel } from "../Domain/Channel";
import { ChatMessage } from "../Domain/ChatMessage";

export interface ChannelWithMessagesDto{
    channel:Channel;
    messages:[ChatMessage];
}