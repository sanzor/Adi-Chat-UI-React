import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useEventBus } from "./EventBusContext";
import { ChatMessage } from "../Domain/ChatMessage";
import { NEW_INCOMING_MESSAGE, PUBLISH_MESSAGE_COMMAND } from "../Events";
import { PublishMessageParams } from "../Dtos/PublishMessageParams";
import { PublishMessageCommand } from "../Domain/Commands/PublishMessageCommand";

interface ChatContextType{
    messagesMap: Map<number, ChatMessage[]> | null;
    publishMessage: (message:PublishMessageParams) => void;
    clearUnreadMessagesForChannel:(channelId:number)=>number;
};

const ChatContext=createContext<ChatContextType|undefined>(undefined);

export const ChatProvider:React.FC<{children:ReactNode}>=({children})=>{
    const [messagesMap, setMessagesMap] = useState<Map<number, ChatMessage[]> | null>(new Map());
    const eventBus = useEventBus();

    useEffect(()=>{
      const handleNewMessage = (event: CustomEvent) => {
        const newMessage: ChatMessage = event.detail as ChatMessage;
        console.log(newMessage);
        setMessagesMap(prev => {
            if (!prev) return new Map([[newMessage.topicId, [newMessage]]]); // Handle initial state
            const updatedMessages = new Map(prev); // Clone the existing Map
            const existingMessages = updatedMessages.get(newMessage.topicId) || [];
            updatedMessages.set(newMessage.topicId, [...existingMessages, newMessage]); // Append new message
            return updatedMessages;
        });
      };

    eventBus.subscribe(NEW_INCOMING_MESSAGE,handleNewMessage);
    return ()=>{
            eventBus.unsubscribe(NEW_INCOMING_MESSAGE,handleNewMessage);
     }
    },[eventBus]);
    const publishMessage=(newMessage:PublishMessageParams)=>{
        eventBus.publishCommand({message:newMessage,kind:PUBLISH_MESSAGE_COMMAND} as PublishMessageCommand)
    };
    const clearUnreadMessagesForChannel = (channelId: number): number => {
      if (!messagesMap) return 0;
  
      setMessagesMap(prev => {
        if (!prev) return null;
  
        const updatedMessages = new Map(prev);
        const clearedCount = updatedMessages.get(channelId)?.length || 0;
        updatedMessages.delete(channelId);
  
        return updatedMessages;
      });
  
      return messagesMap.get(channelId)?.length || 0; // Return the number of cleared messages
    };
    
      return (
        <ChatContext.Provider value={{ messagesMap, publishMessage ,clearUnreadMessagesForChannel}}>
          {children}
        </ChatContext.Provider>
      );
};
export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
      throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};