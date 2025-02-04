import { ChatMessage } from "../Domain/ChatMessage";

export interface GetNewestMessagesResult{
    channelId:string;
    messages:ChatMessage[]
}