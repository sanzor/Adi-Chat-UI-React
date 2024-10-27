import React, { useEffect } from "react";
import { SUBSCRIBE_COMMAND_RESULT_U,
         SET_CHAT,
         ADD_CHANNEL
} from "../Events";
import { Channel } from "../Domain/Channel";
import ChannelComponent from "./ChannelComponent";
import { useEventBus } from "./EventBusContext";
export interface ChannelsComponentProps{
    channels:Channel[],
    setChannels:React.Dispatch<React.SetStateAction<Channel[]>>,
    setCurrentChannel:React.Dispatch<React.SetStateAction<Channel|null>>;
    currentChannel:Channel|null;
    handleUnsubscribe:(channel:Channel)=>void;
}
const ChannelsComponent:React.FC<ChannelsComponentProps>=({
    channels,
    currentChannel,
    setCurrentChannel,
    setChannels,
    handleUnsubscribe})=>{
   const EventBus=useEventBus()
    useEffect(()=>{
        EventBus.subscribe(SUBSCRIBE_COMMAND_RESULT_U,()=>{});//onSubscribeResultU);
    },[]);


    useEffect(()=>{
        const handleAddChannel=(channel:Channel)=>{
            if(!channels.find((c)=>c.id===channel.id)){
                const newChannelList=[...channels,channel];
                setChannels(newChannelList);
            }
        };
        EventBus.subscribe(ADD_CHANNEL,handleAddChannel);
        return ()=>{
            EventBus.unsubscribe(ADD_CHANNEL,handleAddChannel);
        };
    },[channels,setChannels]);

    const handleOpenChat = (channel: Channel) => {
        setCurrentChannel(channel);
        EventBus.publishEvent(SET_CHAT, channel);
      };
    return(
    <>
       <div id="channelsPanel" className="channelsPanel">
                  <label id="channelsLabel">Channels</label>
                  <div id="channelsAreaPanel">
                          <div id="channelsContainer" className="chatScroll">
                            {channels.map((channel)=>(
                                <ChannelComponent
                                    key={channel.id} 
                                    channel={channel} 
                                    onUnsubscribe={()=>handleUnsubscribe(channel)}
                                    onOpenChat={()=>handleOpenChat(channel)}/>
                            ))}
                          </div>
                  </div>
        </div>
    </>
    );
};


export default ChannelsComponent;