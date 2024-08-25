import EventBus from "./EventBus";
import React ,{useState,useEffect} from 'react';
import { Channel } from "../Domain/Channel";

interface ChannelComponentProps{
    channel:
}
const ChannelComponent:React.FC<ChannelComponentProps>=({channel,onUnsubscribe,onOpenChat})=>{
    return (<></>);
};

export default ChannelComponent;
