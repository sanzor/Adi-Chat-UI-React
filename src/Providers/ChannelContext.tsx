import React, { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { Channel } from "../Domain/Channel";
import { getDataAsync, getItemFromStorage, setItemInStorage } from "../Utils";
import { CHANNELS, CURRENT_CHANNEL } from "../Constants";
import { useEventBus } from "./EventBusContext";
import { GetUserSubscriptionsResult } from "../Dtos/GetUserSubscriptionsResult";
import config from "../Config";
import { useUser } from "./UserContext";
import { User } from "../Domain/User";
import { ADD_CHANNEL, GET_NEWEST_MESSAGES_FOR_USER_COMMAND, REMOVE_CHANNEL } from "../Events";
import { GetNewestMessagesForUserCommand } from "../Domain/Commands/GetNewestMessagesForUserCommand";

interface ChannelsContextType{
    channels:Channel[]|null;
    currentChannel:Channel|null;
    setCurrentChannel:(channel:Channel|null)=>void;
    setChannels:(channels:Channel[] |((prevChannels:Channel[])=>Channel[]))=>void;
};
const ChannelsContext=createContext<ChannelsContextType | undefined>(undefined);
const getChannels=async(user:User):Promise<GetUserSubscriptionsResult>=>{
    var channels=await getDataAsync(`${config.baseHttpUrl}/get_subscriptions/${user.id}`);
    console.log(channels);
    return channels;
 };

export const ChannelsProvider:React.FC<{children:ReactNode}>=({children})=>{
    const eventBus=useEventBus();
    console.log("inside channels provider");
    const {user}=useUser();
    console.log("after fetching user");
    const [channels,setChannels]=useState<Channel[]>(()=>{
        const storedChannels=getItemFromStorage<Channel[]>(CHANNELS);
        return storedChannels ?storedChannels: [];
    });
    const [currentChannel, setCurrentChannel] = useState<Channel | null>(() => {
        const storedCurrentChannel = localStorage.getItem(CURRENT_CHANNEL);
        return storedCurrentChannel ? JSON.parse(storedCurrentChannel) : null;
      });
    useEffect(()=>{
        setItemInStorage(CHANNELS,channels);
        console.log(channels);
    },[channels]);

    useEffect(()=>{
        setItemInStorage(CURRENT_CHANNEL,currentChannel);
    },[currentChannel]);
    
    useEffect(()=>{
              console.log("sugi");
              channels?.map(channel=>{
              let command:GetNewestMessagesForUserCommand={user_id:user!.id,count:10,kind:GET_NEWEST_MESSAGES_FOR_USER_COMMAND};
              console.log(command);
              eventBus.publishCommand(command);
              return channel;
            });
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
        eventBus.subscribe(ADD_CHANNEL, handleAddChannel);
        eventBus.subscribe(REMOVE_CHANNEL,handleRemoveChannel);
        return () => {
          eventBus.unsubscribe(ADD_CHANNEL, handleAddChannel);
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

    return (<ChannelsContext.Provider value={{channels,setChannels,currentChannel:currentChannel,setCurrentChannel}}>{children}</ChannelsContext.Provider>);
};

export const useChannels=()=>{
    const context=useContext(ChannelsContext);
    if(!context){
        throw new Error("useChannels must be used within a provider");
    }
    return context;
}

