import React, { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { Channel } from "../Domain/Channel";
import { getDataAsync, getItemFromStorage, setItemInStorage } from "../Utils";
import { CHANNELS, CURRENT_CHANNEL } from "../Constants";
import { useEventBus } from "../Components/EventBusContext";
import { GetUserSubscriptionsResult } from "../Dtos/GetUserSubscriptionsResult";
import config from "../Config";
import { useUser } from "./UserContext";
import { User } from "../Domain/User";
import { ADD_CHANNEL, REMOVE_CHANNEL } from "../Events";

interface ChannelsContextType{
    channels:Channel[]|null;
    currentChannel:Channel|null;
    setChannels:(channels:Channel[]|null)=>void;
};
const ChannelsContext=createContext<ChannelsContextType | undefined>(undefined);
const getChannels=async(user:User):Promise<GetUserSubscriptionsResult>=>{
    var channels=await getDataAsync(`${config.baseHttpUrl}/get_subscriptions/${user.id}`);
    console.log(channels);
    return channels;
 };

export const ChannelsProvider:React.FC<{children:ReactNode}>=({children})=>{
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
    useEffect(()=>{
        setItemInStorage(CHANNELS,channels);
        console.log(channels);
    },[channels]);

    useEffect(()=>{
        setItemInStorage(CURRENT_CHANNEL,currentChannel);
    },[currentChannel]);
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
    useEffect(()=>{
        const storedChannels=getItemFromStorage<Channel[]>(CHANNELS);
        if(storedChannels){
            setChannels(storedChannels);
        }else{
            localStorage.removeItem(CHANNELS);
        }
    });
    useEffect(() => {
        setItemInStorage(CHANNELS, channels);
      }, [channels]);
    useEffect(() => {
        setItemInStorage(CURRENT_CHANNEL, currentChannel);
      }, [currentChannel]);
    useEffect(()=>{
        const fetchChannels=async()=>{
            try{
                const fetchedChannels=await getChannels(user!);
                setChannels(fetchedChannels.subscriptions);
                setItemInStorage(CHANNELS,fetchedChannels.subscriptions);
            }catch(error){
                console.error("Error fetching channels",error);
            }
        }
    });
    const updateChannels=(newChannels:Channel[]|null)=>{
        setChannels(newChannels);
        if(newChannels){
            setItemInStorage(CHANNELS,newChannels);
        }else{
            localStorage.removeItem(CHANNELS);
        }
    };
    return (<ChannelsContext.Provider value={{channels,setChannels: updateChannels}}></ChannelsContext.Provider>);
};

export const useChannels=()=>{
    const context=useContext(ChannelsContext);
    if(!context){
        throw new Error("useChannels must be used within a provider");
    }
    return context;
}

