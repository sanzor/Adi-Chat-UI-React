import React, { createContext, ReactNode, useContext, useState } from "react";
import { ChatMessage } from "../Domain/ChatMessage";

interface MessagesCacheContextType {
    getMessagesForChannel: (channelId: number) => ChatMessage[];
    updateMessagesForChannel: (channelId: number, newMessages: ChatMessage[]) => void;
}

const MessagesCacheContext = createContext<MessagesCacheContextType | undefined>(undefined);

export const MessagesCacheProvider:React.FC<{children:ReactNode}>=({children})=>{
    const [messagesMap,setMessagesMap]=useState<Map<number,ChatMessage[]>>(new Map());
    const getMessagesForChannel=(channelId:number):ChatMessage[]=>{
        return messagesMap.get(channelId) ||[];
    };
    const updateMessagesForChannel=(channelId:number,newMessages:ChatMessage[])=>{
        setMessagesMap(prev=>{
            const updatedMap=new Map(prev);
            updatedMap.set(channelId,newMessages);
            return updatedMap;
        });
    }
    return (<MessagesCacheContext.Provider value={{getMessagesForChannel,updateMessagesForChannel}}>{children}</MessagesCacheContext.Provider>)
}

export const useMessagesCache=()=>{
    const context=useContext(MessagesCacheContext);
    if(!context){
        throw new Error("useMessagesCache must be used within a MessagesCacheProvider");
    }
    return context;
};