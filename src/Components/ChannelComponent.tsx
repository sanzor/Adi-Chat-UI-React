import React ,{} from 'react';
import { Channel } from "../Domain/Channel";
import '../css/channels.css'
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
        <button  onClick={handleUnsubscribe}>X</button>
        <button  onClick={handleOpenChat}>{channel.name}</button>
    </span>
    </>);
};

export default ChannelComponent;
