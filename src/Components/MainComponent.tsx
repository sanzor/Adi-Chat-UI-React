import { useState } from "react";
import ChannelsComponent from "./ChannelsComponent";
import ChatComponent from "./ChatComponent";
import ChatSendComponent from "./ChatSendComponent";
import '../css/specific.css';
import '../css/general.css';
import { SubscribeCommandResultDto } from "../Dtos/SocketCommandResults/SubscribeCommandResultDto";
import { ADD_CHANNEL, SET_CHAT, SUBSCRIBE_COMMAND_RESULT } from "../Events";
import EventBus from "./EventBus";
import { CHANNELS, CURRENT_CHANNEL, KIND } from "../Constants";
import { SubscribeCommand } from "../Domain/Commands/SubscribeCommand";
import { getItemFromStorage, setItemInStorage } from "../Utils";
import { Channel } from "../Domain/Channel";
export interface MainComponentProps{
    onLogout:()=>void;
}
const MainComponent:React.FC<MainComponentProps> =()=>{
    const [subscribe,setSubscribe]=useState('');
    const handleLogout=()=>{

    };

    const handleSubscribe=async()=>{
        async function onOwnSubscribeResult(ev:CustomEvent,resolve:(value: SubscribeCommandResultDto | PromiseLike<SubscribeCommandResultDto>) => void,_:(reason?: any) => void){
            EventBus.unsubscribe(SUBSCRIBE_COMMAND_RESULT,(_:any)=>{
                console.log("unsubscribed from subscribe_result");
            });
           resolve(ev.detail as SubscribeCommandResultDto);
        }
       
        var subscribeResult =await new Promise<SubscribeCommandResultDto>((resolve,reject)=>{
            console.log(KIND);
            EventBus.subscribe(SUBSCRIBE_COMMAND_RESULT,(ev:CustomEvent)=>onOwnSubscribeResult(ev,resolve,reject));
            EventBus.publishCommand({kind:"subscribe",topic: subscribe}as SubscribeCommand);
        });
        var _=await handleSubscribeResultAsync(subscribeResult);
    };
    const handleSubscribeResultAsync= function(subscribeResult:SubscribeCommandResultDto){

        console.log(subscribeResult.result);
        if(subscribeResult.result!="ok" && subscribeResult.result!="already_subscribed"){
            var message="Could not subscribe to channel:"+subscribe
            console.log(message);
            return new Error(message);
        }
        if(subscribeResult.result=='already_subscribed'){
            console.log("already subscribed");
            return;
        }
        var targetChannel:Channel={id:subscribeResult.topic!.id,name:subscribeResult.topic!.name}!;
        var existingChannels=getItemFromStorage<Array<Channel>>(CHANNELS);
        if(!existingChannels){
            setItemInStorage(CURRENT_CHANNEL,targetChannel);
            EventBus.publishEvent(SET_CHAT,targetChannel);
            setItemInStorage(CHANNELS,[targetChannel]);
            EventBus.publishEvent(ADD_CHANNEL,targetChannel);
            return;
        }
        var newChannelList=[...existingChannels,targetChannel];
        var currentChannel=getItemFromStorage<Channel>(CURRENT_CHANNEL);
        console.log(currentChannel);
        if(currentChannel==null ||  !existingChannels.find(x=>x.id!=currentChannel?.id)){
            setItemInStorage(CURRENT_CHANNEL,targetChannel);
            setItemInStorage(CHANNELS,newChannelList);
            EventBus.publishEvent(SET_CHAT,targetChannel);
            EventBus.publishEvent(ADD_CHANNEL,targetChannel);
            return;
        }
        
        setItemInStorage(CHANNELS,newChannelList);
        EventBus.publishEvent(ADD_CHANNEL,targetChannel);
        if(state.first_chat_set==false){
            state.first_chat_set=true;
            EventBus.publishEvent(SET_CHAT,targetChannel);
        }
    }
    return (
    <>
    <div id="parentPanel" className="parent">
    <div id="mainPanel">
        <button id="logoutBtn" onClick={handleLogout}>Logout</button>
        <div id="connectButtonsPanel" >            
            <button id="connectBtn" type="button">Connect</button>
            <button id="disconnectBtn" className="disconnectButton" type="button" value="Disconnect">
                Disconnect
            </button>
        </div>
        <div id="subscribeButtonPanel" className="panel">
            <input  id="subscribeBox" defaultValue={""} type="text" value={subscribe} onChange={(e)=>setSubscribe(e.target.value)}/>
            <label id="subscribeLabel" className="subscribeLabel" >Channel</label>
            <button id="subscribeBtn" className="subscribeButton" type="button" onClick={handleSubscribe}>Subscribe</button>
        </div> 
        <ChannelsComponent></ChannelsComponent>
        <ChatComponent></ChatComponent>
        <ChatSendComponent></ChatSendComponent>
    </div></div>
    </>
    );
};
export default MainComponent;