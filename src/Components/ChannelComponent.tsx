import React ,{} from 'react';
import { Channel } from "../Domain/Channel";
import '../css/channels.css'
import { useChatActions } from '../Providers/ChatActionsContext';
interface ChannelComponentProps{
    channel:Channel;
    onUnsubscribe:(channel:Channel)=>void;
    onOpenChat:(channel:Channel)=>void;
}
const ChannelComponent:React.FC<ChannelComponentProps>=({channel,onUnsubscribe,onOpenChat})=>{
    const {messagesMap}=useChatActions();
    const unreadCount=messagesMap?.get(channel.id)?.length||0;
    const handleUnsubscribe=function(){
         onUnsubscribe(channel);
    };
    const handleClick=function(){
        onOpenChat(channel);
    };
    console.log(channel);
    return (
    <>
    <span className="channelRow" data-channel={JSON.stringify(channel)}>
        {unreadCount>0 && <p className="newMessagesBox">{unreadCount}</p>}
        <button  onClick={handleUnsubscribe}>X</button>
        <button  onClick={handleClick}>{channel.name}</button>
    </span>
    </>);
};

export default ChannelComponent;
