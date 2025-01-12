import React, { useEffect, useRef } from "react";
import { SUBSCRIBE_COMMAND_RESULT_U,
         SET_CHAT} from "../Events";
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
    setCurrentChannel,
    handleUnsubscribe})=>{
   const EventBus = useEventBus();
   const channelsRef = useRef<Channel[]>(channels);
   
   useEffect(() => {
        channelsRef.current = channels;
      }, [channels]);
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
       <div id="channelsPanel" className="channelsPanel">
                  <label id="channelsLabel">Channels</label>
                  <div id="channelsAreaPanel">
                          <div id="channelsContainer" className="chatScroll">
                            {channels.map((channel)=>(
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