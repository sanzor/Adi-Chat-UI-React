import React, { useEffect } from "react";
import { SUBSCRIBE_COMMAND_RESULT_U} from "../Events";
import { Channel } from "../Domain/Channel";
import ChannelComponent from "./ChannelComponent";
import { useEventBus } from "../Providers/EventBusContext";
import '../css/channels.css';
import { useSubscriptions } from "../Providers/SubscriptionsContext";
import { useChatActions } from "../Providers/ChatActionsContext";

const ChannelsComponent:React.FC=()=>{
   const EventBus = useEventBus();
   const {channels,unsubscribeFromChannel,openChannel}=useSubscriptions();
   const {fetchMessagesForChannel}=useChatActions();

    useEffect(()=>{
        EventBus.subscribe(SUBSCRIBE_COMMAND_RESULT_U,()=>{});//onSubscribeResultU);
    },[]);

// Only depend on EventBus and setChannels

    const handleOpenChat = (channel: Channel) => {
        openChannel(channel);
        fetchMessagesForChannel(channel.id,10);
      };

    const internalUnsubscribe=(channel:Channel)=>{
        console.log(`Triggering unsubscribe for channel:${channel}`);
        unsubscribeFromChannel(channel);
    };
    const handleRemoveAll=()=>{
        channels?.map(chan=>{
            unsubscribeFromChannel(chan);
        });
    }
    return(
    <>
       <div id="channelsPanel">
                  <button onClick={handleRemoveAll}>Remove all</button>
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