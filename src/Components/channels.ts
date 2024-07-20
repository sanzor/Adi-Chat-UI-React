import EventBus from "../EventBus";
import { ChatMessage } from "../Domain/ChatMessage";
import { Channel } from "../Domain/Channel";
import{channelsContainer} from "../Elements";
import { setItemInStorage,getItemFromStorage } from "../Utils";
import {subscribeBtn,subscribeBox} from "../Elements";
import { KIND, SOCKET_COMMAND, CURRENT_CHANNEL} from "../Constants";
import {
    REFRESH_CHANNELS_COMMAND_RESULT, 
    SUBSCRIBE_COMMAND_RESULT,
    SUBSCRIBE_COMMAND_RESULT_U,

    UNSUBSCRIBE_COMMAND, 
    UNSUBSCRIBE_BUTTON_CLICK,
    UNSUBSCRIBE_COMMAND_RESULT,
    UNSUBSCRIBE_COMMAND_RESULT_U ,
    
    SET_CHAT,
    RESET_CHAT,
    NEW_INCOMING_MESSAGE,
    SET_CHANNELS,
    ADD_CHANNEL,
    REMOVE_CHANNEL,
    CHANNEL_CLICK,
    SUBSCRIBE_COMMAND} from "../Events";
import { SubscribeCommand } from "../Domain/Commands/SubscribeCommand";
import { SubscribeCommandResultDto } from "../Dtos/SocketCommandResults/SubscribeCommandResultDto";
import { UnsubscribeCommandResultDto } from "../Dtos/SocketCommandResults/UnsubscrirbeCommandResultDto";


const CHANNELS="channels";

const TOPIC_ID="topicId";


EventBus.subscribe(SUBSCRIBE_COMMAND_RESULT_U,onSubscribeResultU);
EventBus.subscribe(UNSUBSCRIBE_COMMAND_RESULT_U,onUnSubscribeResultU);
EventBus.subscribe(REFRESH_CHANNELS_COMMAND_RESULT,onRefreshChannelsCommandResult);
EventBus.subscribe(NEW_INCOMING_MESSAGE,onNewIncomingMessage);

EventBus.subscribe(UNSUBSCRIBE_BUTTON_CLICK,onUnsubscribeAsync);
EventBus.subscribe(CHANNEL_CLICK,onChannelClick);

function onNewIncomingMessage(ev:CustomEvent){
     var message=ev.detail as ChatMessage;
     var currentChannel=getItemFromStorage<Channel>(CURRENT_CHANNEL);
     if(currentChannel ==null){
        return;
     }
     updateChannelsOnMessage(message);
     
 }

 function updateChannelsOnMessage(data:ChatMessage){
    var targetChannel=Array.from(channelsContainer.children)
        .filter(child=>(child as HTMLDivElement).innerText==data.topicId.toString());
}




subscribeBtn.addEventListener("click",onSubscribeAsync);


function onChannelClick(event:CustomEvent){
    var channel=event.detail;
    setItemInStorage(CURRENT_CHANNEL,channel);
    EventBus.publish(SET_CHAT,channel);
}
function onRefreshChannelsCommandResult(ev:CustomEvent){
    var channels=ev.detail as Array<Channel>;
   
    if(channels.length==0 || !channels){
        EventBus.publish(SET_CHANNELS,[]);
        return;

        
    }
    setItemInStorage(CHANNELS,channels);
    EventBus.publish(SET_CHANNELS,channels);
    var currentChannel=getItemFromStorage<Channel>(CURRENT_CHANNEL)!;
    
    if(currentChannel==null || !channels.find(x=>x.id==currentChannel.id)){
        setItemInStorage(CURRENT_CHANNEL,channels[0]);
        EventBus.publish(SET_CHAT,channels[0]);
        return;
    }
    EventBus.publish(SET_CHAT,currentChannel);

}

async function onSubscribeAsync(){
   
    function onOwnSubscribeResult(ev:CustomEvent,resolve:(value: SubscribeCommandResultDto | PromiseLike<SubscribeCommandResultDto>) => void,_:(reason?: any) => void){
        EventBus.unsubscribe(SUBSCRIBE_COMMAND_RESULT,(_:any)=>{
            console.log("unsubscribed from subscribe_result");
        });
       resolve(ev.detail as SubscribeCommandResultDto);
    }
   
    var subscribeResult =await new Promise<SubscribeCommandResultDto>((resolve,reject)=>{
        console.log(KIND);
        EventBus.subscribe(SUBSCRIBE_COMMAND_RESULT,(ev:CustomEvent)=>onOwnSubscribeResult(ev,resolve,reject));
        EventBus.publish(SUBSCRIBE_COMMAND,{kind:"subscribe",topic: subscribeBox.value}as SubscribeCommand);
    });
    var _=await handleSubscribeResultAsync(subscribeResult);
}
const state={
    first_chat_set:false
};
async function handleSubscribeResultAsync(subscribeResult:SubscribeCommandResultDto){

    console.log(subscribeResult.result);
    if(subscribeResult.result!="ok" && subscribeResult.result!="already_subscribed"){
        var message="Could not subscribe to channel:"+subscribeBox.value;
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
        
        EventBus.publish(SET_CHAT,targetChannel);
        setItemInStorage(CHANNELS,[targetChannel]);
        EventBus.publish(ADD_CHANNEL,targetChannel);
        return;
    }
    var newChannelList=[...existingChannels,targetChannel];
    var currentChannel=getItemFromStorage<Channel>(CURRENT_CHANNEL);
    console.log(currentChannel);
    if(currentChannel==null ||  !existingChannels.find(x=>x.id!=currentChannel?.id)){
        setItemInStorage(CURRENT_CHANNEL,targetChannel);
        setItemInStorage(CHANNELS,newChannelList);
        EventBus.publish(SET_CHAT,targetChannel);
        EventBus.publish(ADD_CHANNEL,targetChannel);
        return;
    }
    
    setItemInStorage(CHANNELS,newChannelList);
    EventBus.publish(ADD_CHANNEL,targetChannel);
    if(state.first_chat_set==false){
        state.first_chat_set=true;
        EventBus.publish(SET_CHAT,targetChannel);
    }
}

async function onUnsubscribeAsync(event:CustomEvent):Promise<void>{
    var channel=event.detail;
    var unsubscribeResult=await new Promise<UnsubscribeCommandResultDto>((resolve,_)=>{
        EventBus.subscribe(UNSUBSCRIBE_COMMAND_RESULT,(ev:CustomEvent)=>{
            EventBus.unsubscribe(REFRESH_CHANNELS_COMMAND_RESULT,function(_:any){
                console.log("unsbuscribed from refresh_channels after unsubscribe from channel");
            });
            resolve(ev.detail as UnsubscribeCommandResultDto);
        });
        EventBus.publish(SOCKET_COMMAND,{[KIND]:UNSUBSCRIBE_COMMAND,"topicId":channel.id});
    });
    var _=await handleUnsubscribeResultAsync(unsubscribeResult);
     
}
async function handleUnsubscribeResultAsync(unsubscribeResult:UnsubscribeCommandResultDto):Promise<any>{
    console.log(unsubscribeResult);
    if(unsubscribeResult.result=="not_joined"){
        console.log("Not joined");
        return "not_joined";
    }
    if(unsubscribeResult.result!="ok"){
        var message="Could not unsubscribe from channel";
        return new Error(message);
    }
    var existingChannels=getItemFromStorage<Array<Channel>>(CHANNELS);
    
    if(!existingChannels){
        setItemInStorage(CURRENT_CHANNEL,null);
        setItemInStorage(CHANNELS,[]);
        EventBus.publish(RESET_CHAT,{});
        return;
    }
    if(existingChannels.length==0){
        setItemInStorage(CURRENT_CHANNEL,null);
        EventBus.publish(RESET_CHAT,{});
        return;
    }
    var currentChannel=getItemFromStorage<Channel>(CURRENT_CHANNEL);
    var newExistingChannels=existingChannels.filter(x=>x.id!=unsubscribeResult.topicId);
    setItemInStorage(CHANNELS,newExistingChannels);
    EventBus.publish(REMOVE_CHANNEL,{[TOPIC_ID]:unsubscribeResult.topicId});
    console.log(unsubscribeResult);
    if(unsubscribeResult.topicId==currentChannel?.id && newExistingChannels && newExistingChannels.length>0){
        console.log(newExistingChannels);
        
        console.log("inside last if");
        setItemInStorage(CURRENT_CHANNEL,newExistingChannels[0]);
        EventBus.publish(SET_CHAT,newExistingChannels[0]);
        
    }
}





function setChannels(channels:Array<Channel>):Array<Channel>{
    setItemInStorage(CHANNELS,channels);
    //updateChannelsContainer(channels);
    return channels;
}




function onSubscribeResultU(ev:CustomEvent):void{
    var channels=setChannels(ev.detail.subscriptions);
    if(channels.length==0){
        EventBus.publish(RESET_CHAT,channels[0]);
        return;
    } 
}



function onUnSubscribeResultU(ev:CustomEvent){
    var channels=setChannels(ev.detail.subscriptions);
    if(channels.length==0){
        EventBus.publish(RESET_CHAT,{});
        return;
    }
    EventBus.publish(SET_CHAT,channels.slice(-1));
}
