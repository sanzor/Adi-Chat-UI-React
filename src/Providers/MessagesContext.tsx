import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useEventBus } from "./EventBusContext";
import { ChatMessage, SENDING } from "../Domain/ChatMessage";
import { AKNOWLEDGE_MESSAGE_COMMAND, GET_NEWEST_MESSAGES_COMMAND, NEW_INCOMING_MESSAGE, NEW_MESSAGE_PUBLISHED, PUBLISH_MESSAGE_COMMAND } from "../Events";
import { PublishMessageParams } from "../Dtos/PublishMessageParams";
import { PublishMessageCommand } from "../Domain/Commands/PublishMessageCommand";
import { AcknowledgeMessageCommand } from "../Domain/Commands/AcknowledgeMessageCommand";
import { ChatMessageDto } from "../Dtos/ChatMessageDto";
import { GetNewestMessagesCommand } from "../Domain/Commands/GetNewestMessagesCommand";
import { Channel } from "../Domain/Channel";
import { useSubscriptions } from "./SubscriptionsContext";
interface MessagesContextType{
    messagesMap: Map<number, ChatMessage[]> | null;
    publishMessage: (message:PublishMessageParams) => void;
    clearUnreadMessagesForChannel:(channelId:number)=>number;
    currentChannel:Channel |null;
}

const MessagesContext=createContext<MessagesContextType|undefined>(undefined);

export const MessagesProvider:React.FC<{children:ReactNode}>=({children})=>{
    const { currentChannel } = useSubscriptions();
    const [messagesMap, setMessagesMap] = useState<Map<number, ChatMessage[]> | null>(new Map());
    const eventBus = useEventBus();
    const stableEventBus = useMemo(() => eventBus, []); 
    const toChatMessage=(messageDto:ChatMessageDto):ChatMessage=>{
       let chatMessage={
        tempId:messageDto.temp_id,
        created_at:messageDto.created_at,
        id:messageDto.id,
        message:messageDto.message,
        status:messageDto.status,
        topicId:messageDto.topic_id,
        userId:messageDto.user_id
      }
      return chatMessage;
    };

    useEffect(() => {
      if (!currentChannel) return;
      // ✅ Fetch messages when channel changes
      console.log(`🔄 Fetching messages for channel ${currentChannel.id}`);
      let getcommand:GetNewestMessagesCommand={kind:GET_NEWEST_MESSAGES_COMMAND,topic_id:currentChannel!.id,count:10};
      eventBus.publishCommand(getcommand);

  }, [currentChannel, eventBus]);
    useEffect(()=>{
      const handleNewIncomingMessage = (event: CustomEvent) => {
        var newMessage: ChatMessage = toChatMessage(event.detail as ChatMessageDto);
        console.log(newMessage);
        setMessagesMap(prev => {
            if (!prev) return new Map([[newMessage.topicId, [newMessage]]]); // Handle initial state
            const updatedMessages = new Map(prev); // Clone the existing Map
            const existingMessages = updatedMessages.get(newMessage.topicId) || [];
            updatedMessages.set(newMessage.topicId,[...existingMessages,newMessage]);
            updatedMessages.get(newMessage.topicId);
            return updatedMessages;
        });
      };
      const handleMessagePublished = (event: CustomEvent) => {
        var publishedMessage: ChatMessage = toChatMessage(event.detail as ChatMessageDto);
        console.log("📩 Received Published Message:", publishedMessage);
    
        setMessagesMap(prev => {
            if (!prev) {
                console.error("⚠️ messagesMap is null, cannot find published message.");
                return new Map();
            }
    
            const updatedMessages = new Map(prev);
            console.log("📌 Current messagesMap:", [...updatedMessages.entries()]);
    
            const existingMessages = updatedMessages.get(publishedMessage.topicId) || [];
    
            console.log("🔍 Checking for tempId:", publishedMessage.tempId);
            console.log("📌 Existing Messages in topic:", existingMessages.map(msg => msg.tempId));
    
            const messageIndex = existingMessages.findIndex(msg => msg.tempId === publishedMessage.tempId);
    
            console.log("🔎 Message Found At Index:", messageIndex);
    
            if (messageIndex === -1) {
                console.error("❌ Error: Published message not found! TempId:", publishedMessage.tempId);
                throw new Error("Published message should exist");
            }
    
            existingMessages[messageIndex] = {
                ...existingMessages[messageIndex],
                status: publishedMessage.status,
                id: publishedMessage.id,
                created_at: publishedMessage.created_at
            };
    
            updatedMessages.set(publishedMessage.topicId, [...existingMessages]);
    
            return updatedMessages;
        });
    
        let ackCommand: AcknowledgeMessageCommand = {
            kind: AKNOWLEDGE_MESSAGE_COMMAND,
            temp_id: publishedMessage.tempId,
            user_id: publishedMessage.userId
        };
    
        console.log("✅ Sending ACK Command:", ackCommand);
        stableEventBus.publishCommand(ackCommand);
    };
    console.log("✅ Subscribing to eventBus events...");
    stableEventBus.subscribe(NEW_INCOMING_MESSAGE,handleNewIncomingMessage);
    stableEventBus.subscribe(NEW_MESSAGE_PUBLISHED,handleMessagePublished);
    return ()=>{
        console.log("❌ Unsubscribing from eventBus events...");
        console.log("❌ ChatProvider Unmounted");
        stableEventBus.unsubscribe(NEW_INCOMING_MESSAGE,handleNewIncomingMessage);
        stableEventBus.unsubscribe(NEW_MESSAGE_PUBLISHED,handleMessagePublished);
     }
    },[stableEventBus]);


    const publishMessage = (newMessage: PublishMessageParams) => {
      var sentMessage: ChatMessage = {
          id: null,
          message: newMessage.message,
          tempId: newMessage.tempId,
          userId: newMessage.userId,
          topicId: newMessage.topicId,
          status: SENDING,
          created_at: null
      };
  
      console.log("📤 Publishing message with tempId:", sentMessage.tempId);
  
      setMessagesMap(prev => {
          if (!prev) return new Map([[sentMessage.topicId, [sentMessage]]]);
  
          const updatedMessages = new Map(prev);
          const existingMessages = updatedMessages.get(sentMessage.topicId) || [];
  
          console.log("📝 Before Adding: Messages in topic:", existingMessages);
          
          updatedMessages.set(sentMessage.topicId, [...existingMessages, sentMessage]); // Append new message
  
          console.log("✅ After Adding: Messages in topic:", updatedMessages.get(sentMessage.topicId));
  
          return updatedMessages;
      });
  
      stableEventBus.publishCommand({ message: newMessage, kind: PUBLISH_MESSAGE_COMMAND } as PublishMessageCommand);
  };
  

    const clearUnreadMessagesForChannel = (channelId: number): number => {
      if (!messagesMap) return 0;
      
      setMessagesMap(prev => {
        if (!prev) return null;
  
        const updatedMessages = new Map(prev);
        const clearedCount = updatedMessages.get(channelId)?.length || 0;
        console.log(`Deleting message ${channelId}`);
        updatedMessages.delete(channelId);
  
        return updatedMessages;
      });
  
      return messagesMap.get(channelId)?.length || 0; // Return the number of cleared messages
    };

      return (
        <MessagesContext.Provider value={{ messagesMap, publishMessage ,clearUnreadMessagesForChannel,currentChannel}}>
          {children}
        </MessagesContext.Provider>
      );
};
export const useChat = () => {
    const context = useContext(MessagesContext);
    if (!context) {
      throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};