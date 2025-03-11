import React ,{} from 'react';
import { Channel } from "../Domain/Channel";
import '../css/channels.css'
import { useChat } from '../Providers/MessagesContext';
interface ChannelComponentProps{
    channel:Channel;
    onUnsubscribe:(channel:Channel)=>void;
    onOpenChat:(channel:Channel)=>void;
}
const ChannelComponent:React.FC<ChannelComponentProps>=({channel,onUnsubscribe,onOpenChat})=>{
    const {messagesMap,clearUnreadMessagesForChannel}=useChat();
    const unreadCount=messagesMap?.get(channel.id)?.length||0;
    const handleUnsubscribe=function(){
         onUnsubscribe(channel);
         clearUnreadMessagesForChannel(channel.id);
    };
    const handleClick=function(){
        clearUnreadMessagesForChannel(channel.id);
        onOpenChat(channel);
    };
    console.log(channel);
    return (
    <>
    <span className="channelRow" data-channel={JSON.stringify(channel)}>
        <p className="newMessagesBox">{unreadCount}</p>
        <button  onClick={handleUnsubscribe}>X</button>
        <button  onClick={handleClick}>{channel.name}</button>
    </span>
    </>);
};

export default ChannelComponent;
