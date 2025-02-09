import React, { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { Channel } from "../Domain/Channel";
import { getItemFromStorage, setItemInStorage } from "../Utils";
import { CHANNELS, CURRENT_CHANNEL } from "../Constants";

interface ChannelsContextType{
    channels:Channel[]|null;
    setChannels:(channels:Channel[]|null)=>void;
};
const ChannelsContext=createContext<ChannelsContextType | undefined>(undefined);

export const ChannelsProvider:React.FC<{children:ReactNode}>=({children})=>{
    const [channels,setChannels]=useState<Channel[]|null>(null);
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
                const fetchedChannels=await getChannels();
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

