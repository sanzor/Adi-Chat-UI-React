import { useEffect } from "react";
import { SUBSCRIBE_COMMAND_RESULT_U,
         UNSUBSCRIBE_COMMAND_RESULT_U,
         REFRESH_CHANNELS_COMMAND_RESULT,
         NEW_INCOMING_MESSAGE,
         UNSUBSCRIBE_BUTTON_CLICK,
         CHANNEL_CLICK,
         UNSUBSCRIBE_COMMAND_RESULT,
         UNSUBSCRIBE_COMMAND,
         RESET_CHAT,
         REMOVE_CHANNEL,
         SET_CHAT
} from "../Events";
import EventBus from "./EventBus";
import { UnsubscribeCommandResultDto } from "../Dtos/SocketCommandResults/UnsubscrirbeCommandResultDto";
import { CHANNELS, CURRENT_CHANNEL, KIND, SOCKET_COMMAND } from "../Constants";
import { UnsubscribeCommand } from "../Domain/Commands/UnsubscribeCommand";
import { getItemFromStorage, setItemInStorage } from "../Utils";
import { Channel } from "../Domain/Channel";
export interface ChannelsComponentProps{

}
const ChannelsComponent:React.FC<ChannelsComponentProps>=(props)=>{

    useEffect(()=>{
        EventBus.subscribe(SUBSCRIBE_COMMAND_RESULT_U,()=>{});//onSubscribeResultU);
    },[]);
    const handleUnsubscribe= async function onUnsubscribeAsync(event:CustomEvent):Promise<void>{
        var channel=event.detail;
        var unsubscribeResult=await new Promise<UnsubscribeCommandResultDto>((resolve,_)=>{
            EventBus.subscribe(UNSUBSCRIBE_COMMAND_RESULT,(ev:CustomEvent)=>{
                EventBus.unsubscribe(REFRESH_CHANNELS_COMMAND_RESULT,function(_:any){
                    console.log("unsbuscribed from refresh_channels after unsubscribe from channel");
                });
                resolve(ev.detail as UnsubscribeCommandResultDto);
            });
            EventBus.publishCommand({[KIND]:UNSUBSCRIBE_COMMAND,topicId:channel.id} as UnsubscribeCommand);
        });
            var _=await handleUnsubscribeResultAsync(unsubscribeResult); 
        };
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
                EventBus.publishEvent(RESET_CHAT,{});
                return;
            }
            if(existingChannels.length==0){
                setItemInStorage(CURRENT_CHANNEL,null);
                EventBus.publishEvent(RESET_CHAT,{});
                return;
            }
            var currentChannel=getItemFromStorage<Channel>(CURRENT_CHANNEL);
            var newExistingChannels=existingChannels.filter(x=>x.id!=unsubscribeResult.topicId);
            setItemInStorage(CHANNELS,newExistingChannels);
            EventBus.publishEvent(REMOVE_CHANNEL,{[TOPIC_ID]:unsubscribeResult.topicId});
            console.log(unsubscribeResult);
            if(unsubscribeResult.topicId==currentChannel?.id && newExistingChannels && newExistingChannels.length>0){
                console.log(newExistingChannels);
                
                console.log("inside last if");
                setItemInStorage(CURRENT_CHANNEL,newExistingChannels[0]);
                EventBus.publishEvent(SET_CHAT,newExistingChannels[0]);
                
            }
        }
        
    };
    return(
    <>
       <div id="channelsPanel" className="channelsPanel">
                  <label id="channelsLabel">Channels</label>
                  <div id="channelsAreaPanel">
                          <div id="channelsContainer" className="chatScroll"></div>
                  </div>
        </div>
    </>
    );
};


export default ChannelsComponent;