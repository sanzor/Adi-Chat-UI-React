import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useEventBus } from "./EventBusContext";
import { ChatMessage, SENDING } from "../Domain/ChatMessage";
import { AKNOWLEDGE_MESSAGE_COMMAND, GET_MESSAGES_AFTER_COMMAND, GET_MESSAGES_AFTER_COMMAND_RESULT, GET_NEWEST_MESSAGES_COMMAND, GET_NEWEST_MESSAGES_COMMAND_RESULT, NEW_INCOMING_MESSAGE, NEW_MESSAGE_PUBLISHED, PUBLISH_MESSAGE_COMMAND, VIEW_MESSAGE_COMMAND } from "../Events";
import { PublishMessageParams } from "../Dtos/PublishMessageParams";
import { PublishMessageCommand } from "../Domain/Commands/PublishMessageCommand";
import { AcknowledgeMessageCommand } from "../Domain/Commands/AcknowledgeMessageCommand";
import { ChatMessageDto } from "../Dtos/ChatMessageDto";
import { GetNewestMessagesCommand } from "../Domain/Commands/GetNewestMessagesCommand";
import { Channel } from "../Domain/Channel";
import { useSubscriptions } from "./SubscriptionsContext";
import { GetMessagesAfterCommand } from "../Domain/Commands/GetMessagesAfterCommand";
import { MessageViewedCommand } from "../Domain/Commands/MessageViewedCommand";

interface ChatActionsContextType{
    messagesMap: Map<number, ChatMessage[]> | null;
    publishMessage: (message:PublishMessageParams) => void;
    markMessageAsViewed(channelId:number,messageId:number):void;
    fetchMessagesForChannel(channelId:number,count:number):void;
    fetchMessagesAfter(channelId:number,lastMessageId:number,count:number):void;
    currentChannel:Channel |null;
}

const ChatActionsContext=createContext<ChatActionsContextType|undefined>(undefined);

export const ChatActionsProvider:React.FC<{children:ReactNode}>=({children})=>{
    const { currentChannel } = useSubscriptions();
    const [messagesMap, setMessagesMap] = useState<Map<number, ChatMessage[]> | null>(new Map());
    const eventBus = useEventBus();
    const stableEventBus = useMemo(() => eventBus, []); 

    const toChatMessage=(messageDto:ChatMessageDto):ChatMessage=>{
       let chatMessage:ChatMessage={
        tempId:messageDto.temp_id,
        created_at:messageDto.created_at ? Number(messageDto.created_at) : Date.now(),
        id:messageDto.id,
        message:messageDto.message,
        status:messageDto.status,
        topicId:messageDto.topic_id,
        userId:messageDto.user_id
      };
      return chatMessage;
    };
    useEffect(()=>{
        const handleFetchMessages=(ev:CustomEvent)=>{
          const result=ev.detail as ChatMessageDto[]??[];
          console.log(`\nHandleFetchMessages:${result}\n`);
          const messages = result.map(toChatMessage);
          console.log("🔄 Received latest messages:", messages);
          appendNewMessagesToExisting(currentChannel?.id!, messages);  
        };
        const handleFetchMessagesAfter=(ev:CustomEvent)=>{
          const result=ev.detail as ChatMessageDto[]??[];
          console.log(`\nHandleFetchAfterMessages:${result}\n`);
          const messages = result.map(toChatMessage);
          console.log("🔄 Received latest messages:", messages);
          appendNewMessagesToExisting(currentChannel?.id!, messages);  
        }
        stableEventBus.subscribe(GET_NEWEST_MESSAGES_COMMAND_RESULT,handleFetchMessages);
        stableEventBus.subscribe(GET_MESSAGES_AFTER_COMMAND_RESULT,handleFetchMessagesAfter);
        return ()=>{
          console.log("❌ Unsubscribing from eventBus events...");
          stableEventBus.unsubscribe(GET_NEWEST_MESSAGES_COMMAND_RESULT,handleFetchMessages);
          stableEventBus.unsubscribe(GET_MESSAGES_AFTER_COMMAND_RESULT,handleFetchMessagesAfter);
        }
    },[]);
  
        // ✅ Fetch messages for a channel (memoized)
        const fetchMessagesForChannel = useCallback((channelId: number, count: number) => {
          stableEventBus.publishCommand({
              kind: GET_NEWEST_MESSAGES_COMMAND,
              topic_id: channelId,
              count
          } as GetNewestMessagesCommand);
      }, [stableEventBus]);
  
      // ✅ Fetch messages after a specific message
      const fetchMessagesAfter = useCallback((channelId: number, lastMessageId: number, count: number) => {
          stableEventBus.publishCommand({
              kind: GET_MESSAGES_AFTER_COMMAND,
              topic_id: channelId,
              from_message_id: lastMessageId,
              count
          } as GetMessagesAfterCommand);
      }, [stableEventBus]);

      /**
   * ✅ Update messages in state (Ensuring correct order)
   */
  const appendNewMessagesToExisting = (channelId: number, newMessages: ChatMessage[]) => {
        setMessagesMap((prev) => {
            const updatedMap = new Map(prev);
            const existingMessages = updatedMap.get(channelId) || [];
    
            // 🔥 Ensure sorting by treating created_at as a number
            const mergedMessages = [...existingMessages, ...newMessages]
                .filter((value, index, self) => self.findIndex(m => m.id === value.id) === index)
                .sort((a, b) => (Number(a.created_at) || 0) - (Number(b.created_at) || 0));
    
            updatedMap.set(channelId, mergedMessages);
            return updatedMap;
        });
    };

  const replaceTempMessage = (channelId: number, tempId: string, newMessage: ChatMessage) => {
    setMessagesMap(prev => {
        if (!prev) return new Map();

        const updatedMessages = new Map(prev);
        const existingMessages = updatedMessages.get(channelId) || [];

        const messageIndex = existingMessages.findIndex(msg => msg.tempId === tempId);
        if (messageIndex === -1) {
          console.error("❌ Message with tempId not found:", tempId);
          return prev;
        }
        existingMessages[messageIndex] = newMessage;
        updatedMessages.set(channelId, [...existingMessages]);

        return updatedMessages;
      });
    };
    useEffect(() => {
      if (!currentChannel) return;
      console.log(`🔄 Fetching messages for channel ${currentChannel.id}`);
      fetchMessagesForChannel(currentChannel.id, 10);
    }, [currentChannel, fetchMessagesForChannel]);  // ✅ `fetchMessagesForChannel` is stable, so `useEffect` won't trigger unnecessarily


    useEffect(() => {
      const handleNewIncomingMessage = (event: CustomEvent) => {
        const newMessage: ChatMessage = toChatMessage(event.detail as ChatMessageDto);
        console.log("📥 Incoming newMessage:", newMessage);
        setMessagesMap(prev => {
          if (!prev) return new Map([[newMessage.topicId, [newMessage]]]);
          const updated = new Map(prev);
          const existing = updated.get(newMessage.topicId) || [];
          updated.set(newMessage.topicId, [...existing, newMessage]);
          return updated;
        });
      };
    
      const handleMessagePublished = (event: CustomEvent) => {
        const publishedMessage: ChatMessage = toChatMessage(event.detail as ChatMessageDto);
        console.log("📩 Received Published Message:", publishedMessage);
    
        // Replace temp message with real one
        setMessagesMap(prev => {
          if (!prev) return new Map();
          const updated = new Map(prev);
          const messages = updated.get(publishedMessage.topicId) || [];
          const index = messages.findIndex(m => m.tempId === publishedMessage.tempId);
          if (index !== -1) {
            messages[index] = { ...publishedMessage, tempId: null };
            updated.set(publishedMessage.topicId, [...messages]);
          }
          return updated;
        });
    
        // ACK
        const ackCommand: AcknowledgeMessageCommand = {
          kind: AKNOWLEDGE_MESSAGE_COMMAND,
          temp_id: publishedMessage.tempId!,
          user_id: publishedMessage.userId
        };
        console.log("✅ Sending ACK Command:", ackCommand);
        stableEventBus.publishCommand(ackCommand);
      };
    
      console.log("✅ Subscribing to events...");
      stableEventBus.subscribe(NEW_INCOMING_MESSAGE, handleNewIncomingMessage);
      stableEventBus.subscribe(NEW_MESSAGE_PUBLISHED, handleMessagePublished);
    
      return () => {
        console.log("❌ Cleaning up events...");
        stableEventBus.unsubscribe(NEW_INCOMING_MESSAGE, handleNewIncomingMessage);
        stableEventBus.unsubscribe(NEW_MESSAGE_PUBLISHED, handleMessagePublished);
      };
    }, []); // ✅ Empty dependencies: safe because eventBus is stable and handlers are stable
    const publishMessage = (newMessage: PublishMessageParams) => {
      console.log("🚀 Incoming newMessage:", newMessage);
    
      const sentMessage: ChatMessage = {
          id: null,
          message: newMessage.message,
          tempId: newMessage.tempId,
          userId: newMessage.userId,
          topicId: newMessage.topicId,
          status: SENDING,
          created_at: 0
      };
    
      console.log("📤 SentMessage BEFORE state update:", sentMessage);
    
      setMessagesMap(prev => {
        if (!prev) return new Map([[sentMessage.topicId, [{ ...sentMessage }]]]);
    
        const updatedMessages = new Map(prev);
        const existingMessages = updatedMessages.get(sentMessage.topicId) || [];
    
        updatedMessages.set(sentMessage.topicId, [...existingMessages, { ...sentMessage }]);
    
        console.log("✅ After Adding to Map:", updatedMessages.get(sentMessage.topicId));
    
        return updatedMessages;
    });
    
      console.log("📬 Publishing to eventBus:", { message: newMessage });
    
      stableEventBus.publishCommand({ 
        message: newMessage, 
        kind: PUBLISH_MESSAGE_COMMAND 
      } as PublishMessageCommand);
      console.log("📌 sentMessage STILL correct after eventBus publish:", sentMessage);
    };

    const markMessageAsViewed = (channelId: number, messageId: number) => {
      eventBus.publishCommand({
        kind: VIEW_MESSAGE_COMMAND,
        topic_id: channelId,
        message_id: messageId
      }as MessageViewedCommand);
  
      setMessagesMap(prev => {
        const updatedMap = new Map(prev);
        const messages = updatedMap.get(channelId) || [];
        const updatedMessages = messages.map(msg =>
          msg.id === messageId ? { ...msg, status: "viewed" } : msg
        );
        updatedMap.set(channelId, updatedMessages);
        return updatedMap;
      });
    };
  


      return (
        <ChatActionsContext.Provider value={{ messagesMap, publishMessage,markMessageAsViewed,currentChannel,fetchMessagesForChannel,fetchMessagesAfter}}>
          {children}
        </ChatActionsContext.Provider>
      );
};
export const useChatActions = () => {
    const context = useContext(ChatActionsContext);
    if (!context) {
      throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};