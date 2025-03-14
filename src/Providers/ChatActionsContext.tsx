import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
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
import { GetNewestMessagesCommandResultDto } from "../Dtos/SocketCommandResults/GetNewestMessagesCommandResultDto";

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
          const result=ev.detail as GetNewestMessagesCommandResultDto;
          console.log(`\nHandleFetchMessages:${result}\n`);
          const messages = result.messages.map(toChatMessage);
          console.log("🔄 Received latest messages:", messages);
          appendNewMessagesToExisting(currentChannel?.id!, messages);  
        };
        const handleFetchMessagesAfter=(ev:CustomEvent)=>{
          const result=ev.detail as GetNewestMessagesCommandResultDto;
          console.log(`\nHandleFetchAfterMessages:${result}\n`);
          const messages = result.messages.map(toChatMessage);
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
    });
  
    const fetchMessagesForChannel = (channelId: number, count: number)=> {
      stableEventBus.publishCommand({ kind: GET_NEWEST_MESSAGES_COMMAND, topic_id: channelId, count } as GetNewestMessagesCommand);
    };  // ✅ Dependencies: Only changes when `eventBus` updates

    const fetchMessagesAfter = (channelId: number, lastMessageId: number, count: number)=> {
      stableEventBus.publishCommand({
          kind: GET_MESSAGES_AFTER_COMMAND,
          topic_id: channelId,
          from_message_id: lastMessageId,
          count
        } as GetMessagesAfterCommand);
      }

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
      
        replaceTempMessage(
          publishedMessage.topicId,
          publishedMessage.tempId!,
          {
            ...publishedMessage, // Copy the published message
            tempId: null // Remove tempId as it's no longer needed
          }
        );
      
        // ✅ Send ACK to server
        let ackCommand: AcknowledgeMessageCommand = {
          kind: AKNOWLEDGE_MESSAGE_COMMAND,
          temp_id: publishedMessage.tempId!,
          user_id: publishedMessage.userId
        };
      
        console.log("✅ Sending ACK Command:", ackCommand);
        eventBus.publishCommand(ackCommand);
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
          created_at:0
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