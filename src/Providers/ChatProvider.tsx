import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useEventBus } from "./EventBusContext";
import { ChatMessage, SENDING, SENT } from "../Domain/ChatMessage";
import { NEW_INCOMING_MESSAGE, NEW_MESSAGE_PUBLISHED, PUBLISH_MESSAGE_COMMAND } from "../Events";
import { PublishMessageParams } from "../Dtos/PublishMessageParams";
import { PublishMessageCommand } from "../Domain/Commands/PublishMessageCommand";
import { v4 as uuidv4 } from 'uuid';
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
      const handleNewIncomingMessage = (event: CustomEvent) => {
        var newMessage: ChatMessage = event.detail as ChatMessage;
        console.log(newMessage);
        setMessagesMap(prev => {
            if (!prev) return new Map([[newMessage.topicId, [newMessage]]]); // Handle initial state
            const updatedMessages = new Map(prev); // Clone the existing Map
            const existingMessages = updatedMessages.get(newMessage.topicId) || [];
            updatedMessages.set(newMessage.topicId,[...existingMessages,newMessage]);
            return updatedMessages;
        });
      };
      const handleMessagePublished=(event:CustomEvent)=>{
          var publishedMessage: ChatMessage = event.detail as ChatMessage;
          console.log(publishedMessage);
          setMessagesMap(prev => {
            if (!prev) return new Map([[publishedMessage.topicId, [publishedMessage]]]); // Handle initial state
            const updatedMessages = new Map(prev); // Clone the existing Map
            const existingMessages = updatedMessages.get(publishedMessage.topicId) || [];
            const messageIndex=existingMessages.findIndex(msg=>msg.tempId==publishedMessage.tempId);
            if(messageIndex==-1){
               throw new Error("Published message should exist");  
            };
            existingMessages[messageIndex]={...existingMessages[messageIndex],status:SENT,id:publishedMessage.id,created_at:publishedMessage.created_at}
            return updatedMessages;
        });

      };
    eventBus.subscribe(NEW_INCOMING_MESSAGE,handleNewIncomingMessage);
    eventBus.subscribe(NEW_MESSAGE_PUBLISHED,handleMessagePublished);
    return ()=>{
        eventBus.unsubscribe(NEW_INCOMING_MESSAGE,handleNewIncomingMessage);
        eventBus.unsubscribe(NEW_MESSAGE_PUBLISHED,handleMessagePublished);
     }
    },[eventBus]);
    const publishMessage=(newMessage:PublishMessageParams)=>{
        var sentMessage:ChatMessage={
          id:null,
          message:newMessage.message,
          tempId:uuidv4(),
          userId:newMessage.userId,
          topicId:newMessage.topicId,
          status:SENDING,
        created_at:null};

        setMessagesMap(prev => {
            if (!prev) return new Map([[sentMessage.topicId, [sentMessage]]]); // Handle initial state
            const updatedMessages = new Map(prev); // Clone the existing Map
            const existingMessages = updatedMessages.get(sentMessage.topicId) || [];
            updatedMessages.set(sentMessage.topicId, [...existingMessages, sentMessage]); // Append new message
            return updatedMessages;
        });
      
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