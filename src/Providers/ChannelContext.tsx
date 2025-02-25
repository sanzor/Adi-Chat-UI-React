import React, { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { Channel } from "../Domain/Channel";
import { getDataAsync, getItemFromStorage, setItemInStorage } from "../Utils";
import { CHANNELS, CURRENT_CHANNEL, MESSAGES } from "../Constants";
import { useEventBus } from "./EventBusContext";
import { GetUserSubscriptionsResult } from "../Dtos/GetUserSubscriptionsResult";
import config from "../Config";
import { useUser } from "./UserContext";
import { User } from "../Domain/User";
import { ADD_CHANNEL_DOM, GET_NEWEST_MESSAGES_FOR_USER_COMMAND, GET_NEWEST_MESSAGES_FOR_USER_COMMAND_RESULT, REMOVE_CHANNEL } from "../Events";
import { GetNewestMessagesForUserCommand } from "../Domain/Commands/GetNewestMessagesForUserCommand";
import { useWebSocket } from "./WebsocketContext";
import { GetNewestMessagesForUserCommandResultDto } from "../Dtos/SocketCommandResults/GetNewestMessagesForUserResultDto";
import { ChannelWithMessagesDto } from "../Dtos/ChannelWithMessagesDto";

interface ChannelsContextType{
    channels:Channel[]|null;
    currentChannel:Channel|null;
    setCurrentChannel:(channel:Channel|null)=>void;
    setChannels:(channels:Channel[] |((prevChannels:Channel[])=>Channel[]))=>void;
    messagesMap: Map<number, ChannelWithMessagesDto> | null;
    setMessagesMap: (
      map:
        | Map<number, ChannelWithMessagesDto> | null
        | ((prevMap: Map<number, ChannelWithMessagesDto> | null) => Map<number, ChannelWithMessagesDto> | null)
    ) => void;
    updateMessageForChannel: (channelId: number, newData: ChannelWithMessagesDto) => void;
};
const ChannelsContext=createContext<ChannelsContextType | undefined>(undefined);
const getChannels=async(user:User):Promise<GetUserSubscriptionsResult>=>{
    var channels=await getDataAsync(`${config.baseHttpUrl}/get_subscriptions/${user.id}`);
    console.log(channels);
    return channels;
 };

export const ChannelsProvider:React.FC<{children:ReactNode}>=({children})=>{
    const {state:{isConnected}}=useWebSocket();
    const eventBus=useEventBus();
    const {user}=useUser();

    const [channels,setChannels]=useState<Channel[]>(()=>{
        const storedChannels=getItemFromStorage<Channel[]>(CHANNELS);
        return storedChannels ?storedChannels: [];
    });
    const [currentChannel, setCurrentChannel] = useState<Channel | null>(() => {
        const storedCurrentChannel = localStorage.getItem(CURRENT_CHANNEL);
        return storedCurrentChannel ? JSON.parse(storedCurrentChannel) : null;
      });
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
      fetchChannels();
    },[]);
    useEffect(()=>{
        setItemInStorage(CHANNELS,channels);
        console.log(channels);
    },[channels]);

    useEffect(()=>{
        setItemInStorage(CURRENT_CHANNEL,currentChannel);
    },[currentChannel]);
    
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
    useEffect(() => {
        const handleAddChannel = (channel: Channel) => {
          
          // Use the latest channelsRef value to check for duplicates
          if (!channels.find((c) => c.id === channel.id)) {
            const newChannelList = [...channels, channel];
            setChannels(newChannelList);
          }
        };
        const handleRemoveChannel = (channelId: number) => {
            setChannels((prev) => prev.filter((c) => c.id !== channelId));
        };
        eventBus.subscribe(ADD_CHANNEL_DOM, handleAddChannel);
        eventBus.subscribe(REMOVE_CHANNEL,handleRemoveChannel);
        return () => {
          eventBus.unsubscribe(ADD_CHANNEL_DOM, handleAddChannel);
          eventBus.unsubscribe(REMOVE_CHANNEL,handleRemoveChannel);
        };
      }, [eventBus]); 
      
    const fetchChannels=async()=>{
        try {
          var fetchedChannelsResult:GetUserSubscriptionsResult=await getChannels(user!);
          console.log("Stored Channels:", fetchedChannelsResult.subscriptions);
          setItemInStorage(CHANNELS,fetchedChannelsResult.subscriptions);
          setChannels(prevChannels => {
            console.log("Previous Channels:", prevChannels);
            console.log("New Channels:", fetchedChannelsResult.subscriptions);
            return [...fetchedChannelsResult.subscriptions];
        });
        } catch (error) {
          console.error("Error fetching channels:", error);
        }
      };

    return (<ChannelsContext.Provider value={{
      channels,
      setChannels,
      currentChannel:currentChannel,
      setCurrentChannel,
      messagesMap,
      setMessagesMap,
      updateMessageForChannel}
    }>{children}</ChannelsContext.Provider>);
};

export const useChannels=()=>{
    const context=useContext(ChannelsContext);
    if(!context){
        throw new Error("useChannels must be used within a provider");
    }
    return context;
}

