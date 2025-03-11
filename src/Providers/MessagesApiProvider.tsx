import React, { createContext, ReactNode, useContext } from "react";
import { Channel } from "../Domain/Channel";
import { useEventBus } from "./EventBusContext";
import { useUser } from "./UserContext";
import { useMessagesCache } from "./MessageCacheProvider";
import { GetNewestMessagesCommand } from "../Domain/Commands/GetNewestMessagesCommand";
import { GET_MESSAGES_AFTER_COMMAND, GET_NEWEST_MESSAGES_COMMAND } from "../Events";
import { ChatMessage } from "../Domain/ChatMessage";
import { GetMessagesAfterCommand } from "../Domain/Commands/GetMessagesAfterCommand";



interface MessagesAPIContextType {
    fetchMessagesForChannel: (channelId: number, count: number) => void;
    fetchMessagesAfter: (channelId: number, lastMessageId: number, count: number) => void;
    refreshMessagesForChannel: (channelId: number) => Channel[];
}

const MessagesApiContext=createContext<MessagesAPIContextType|undefined>(undefined);

const MessagesApiProvider:React.FC<{children:ReactNode}>=()=>{
    const eventBus = useEventBus();
    const { user } = useUser();
    const { getMessagesForChannel,updateMessagesForChannel} = useMessagesCache();

    const fetchMessagesForChannel=(channelId:number,count:number)=>{
        eventBus.publishCommand({
            count:count,kind:GET_MESSAGES_AFTER_COMMAND,
            topic_id:channelId}as GetNewestMessagesCommand)
    };
    const fetchMessagesAfter=(channelId:number,lastMessageId:number,count:number)=>{
        eventBus.publishCommand({
            topic_id:channelId,
            from_message_id:lastMessageId,
            kind:GET_MESSAGES_AFTER_COMMAND,
            count:count} as GetMessagesAfterCommand);
    }

    return (<MessagesApiContext.Provider value={{fetchMessagesForChannel,fetchMessagesAfter}}>{children}</MessagesApiContext.Provider>);
};

export const useMessagesApi=()=>{
    const context=useContext(MessagesApiContext);
    if (!context) {
        throw new Error("useMessagesAPI must be used within a MessagesAPIProvider");
    }
    return context;
};