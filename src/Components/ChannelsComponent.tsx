import React, { useEffect } from "react";
import { SUBSCRIBE_COMMAND_RESULT_U,
         SET_CHAT} from "../Events";
import { Channel } from "../Domain/Channel";
import ChannelComponent from "./ChannelComponent";
import { useEventBus } from "../Providers/EventBusContext";
import '../css/channels.css';
import { useChannels } from "../Providers/ChannelContext";
export interface ChannelsComponentProps{
    handleUnsubscribe:(channel:Channel)=>void;
}
const ChannelsComponent:React.FC<ChannelsComponentProps>=({
    handleUnsubscribe})=>{
   const EventBus = useEventBus();
   const {channels,setCurrentChannel}=useChannels();

    useEffect(()=>{
        EventBus.subscribe(SUBSCRIBE_COMMAND_RESULT_U,()=>{});//onSubscribeResultU);
    },[]);

// Only depend on EventBus and setChannels

    const handleOpenChat = (channel: Channel) => {
        setCurrentChannel(channel);
        EventBus.publishEvent(SET_CHAT, channel);
      };

    const internalUnsubscribe=(channel:Channel)=>{
        console.log(`Triggering unsubscribe for channel:${channel}`);
        handleUnsubscribe(channel);
    };
    return(
    <>
       <div id="channelsPanel">
                  <label id="channelsLabel">Channels</label>
                  <div id="channelsAreaPanel">
                          <div id="channelsContainer" className="chatScroll">
                            {Array.isArray(channels) && channels.map((channel)=>(
                                <ChannelComponent
                                    key={channel.id} 
                                    channel={channel} 
                                    onUnsubscribe={internalUnsubscribe}
                                    onOpenChat={()=>handleOpenChat(channel)}/>
                            ))}
                          </div>
                  </div>
        </div>
    </>
    );
};


export default ChannelsComponent;