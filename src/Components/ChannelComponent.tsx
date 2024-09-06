import EventBus from "./EventBus";
import React ,{useState,useEffect} from 'react';
import { Channel } from "../Domain/Channel";

interface ChannelComponentProps{
    channel:Channel;
    onUnsubscribe:(channel:Channel)=>void;
    onOpenChat:(channel:Channel)=>void;
}
const ChannelComponent:React.FC<ChannelComponentProps>=({channel,onUnsubscribe,onOpenChat})=>{
    const handleUnsubscribe=function(){
         onUnsubscribe(channel);
    };
    const handleOpenChat=function(){
        onOpenChat(channel);
    }
    return (
    <>
    <span className="channelRow" data-channel={JSON.stringify(channel)}>
        <p className="newMessagesBox">0</p>
        <button  onClick={handleUnsubscribe}></button>
        <button  onClick={handleOpenChat}></button>
    </span>
    </>);
};

export default ChannelComponent;
