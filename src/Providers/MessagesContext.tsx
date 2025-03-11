import React, { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { getItemFromStorage } from "../Utils";
import { MESSAGES } from "../Constants";
import { useEventBus } from "./EventBusContext";
import { useUser } from "./UserContext";
import { GET_NEWEST_MESSAGES_FOR_USER_COMMAND, GET_NEWEST_MESSAGES_FOR_USER_COMMAND_RESULT } from "../Events";
import { GetNewestMessagesForUserCommand } from "../Domain/Commands/GetNewestMessagesForUserCommand";
import { useWebSocket } from "./WebsocketContext";
import { GetNewestMessagesForUserCommandResultDto } from "../Dtos/SocketCommandResults/GetNewestMessagesForUserResultDto";
import { ChannelWithMessagesDto } from "../Dtos/ChannelWithMessagesDto";
import { useSubscriptions } from "./SubscriptionsContext";
import { ChatMessage } from "../Domain/ChatMessage";

interface MessagesContextType {
    fetchMessagesForChannel:(channelId:number,count:number)=>ChatMessage[];
    fetchMessagesAfter(channelId:number,lastMessageId:number,count:number):ChatMessage[];
    refreshMessagesForChannel(channelId:number):void;
    getMessagesForChannel(channelId:number):ChatMessage[];
};
const MessagesContext=createContext<MessagesContextType | undefined>(undefined);


export const MessagesProvider:React.FC<{children:ReactNode}>=({children})=>{
    const {state:{isConnected}}=useWebSocket();
    const eventBus=useEventBus();
    const {user}=useUser();
    const {channels}=useSubscriptions();
   
    const updateMessageForChannel = (channelId: number, newData: ChannelWithMessagesDto) => {
        setMessagesMap((prevMap) => {
          // Create a new Map instance to trigger state update
          const updatedMap = new Map(prevMap ?? []);
          updatedMap.set(channelId, newData);
          return updatedMap;
        });
      };
    const [messagesMap, setMessagesMap] = useState<Map<number, ChannelWithMessagesDto> | null>(() => {
        const storedMessagesMap = getItemFromStorage<Map<number, ChannelWithMessagesDto>>(MESSAGES);
        return storedMessagesMap ? storedMessagesMap : new Map();
    });

    useEffect(()=>{
      const handleGetNewestMessagesForUser=(ev:CustomEvent)=>{
          var topicsWithChannels:GetNewestMessagesForUserCommandResultDto=ev.detail;
          console.log(topicsWithChannels);
          const map = new Map<number, ChannelWithMessagesDto>(
            (topicsWithChannels.channels_with_messages ?? []).map(item => [item.channel.id, item])
          );
          setMessagesMap(map);
      };
      if(!isConnected){
        return;
      }
      channels?.map(channel=>{
              let command:GetNewestMessagesForUserCommand={user_id:user!.id,count:10,kind:GET_NEWEST_MESSAGES_FOR_USER_COMMAND};
              console.log(command);
              eventBus.publishCommand(command);
              return channel;
          });
      eventBus.subscribe(GET_NEWEST_MESSAGES_FOR_USER_COMMAND_RESULT,handleGetNewestMessagesForUser);
      return ()=>{
        eventBus.unsubscribe(GET_NEWEST_MESSAGES_FOR_USER_COMMAND_RESULT,handleGetNewestMessagesForUser);
      }
    },[]);
    
    return (<MessagesContext.Provider value={{
      messagesMap,
      setMessagesMap,
      updateMessageForChannel}
    }>{children}</MessagesContext.Provider>);
};

export const useChannels=()=>{
    const context=useContext(MessagesContext);
    if(!context){
        throw new Error("useChannels must be used within a provider");
    }
    return context;
}

