import { useEffect, useState } from "react";
import ChannelsComponent from "./ChannelsComponent";
import ChatComponent from "./ChatComponent";
import ChatSendComponent from "./ChatSendComponent";
import '../css/specific.css';
import '../css/general.css';
import { SubscribeCommandResultDto } from "../Dtos/SocketCommandResults/SubscribeCommandResultDto";
import { ADD_CHANNEL, REFRESH_CHANNELS_COMMAND_RESULT, REMOVE_CHANNEL, RESET_CHAT, SET_CHAT, SUBSCRIBE_COMMAND, SUBSCRIBE_COMMAND_RESULT, UNSUBSCRIBE_COMMAND, UNSUBSCRIBE_COMMAND_RESULT } from "../Events";
import { useEventBus } from "./EventBusContext";
import { CHANNELS, CURRENT_CHANNEL, KIND, TOPIC_ID } from "../Constants";
import { SubscribeCommand } from "../Domain/Commands/SubscribeCommand";
import { getItemFromStorage, setItemInStorage } from "../Utils";
import { Channel } from "../Domain/Channel";
import { UnsubscribeCommandResultDto } from "../Dtos/SocketCommandResults/UnsubscrirbeCommandResultDto";
import { UnsubscribeCommand } from "../Domain/Commands/UnsubscribeCommand";
import { connect } from "../Websocket/Websocket";
import { User } from "../Domain/User";
import config from "../Config";
export interface MainComponentProps{
    onLogout:()=>void;
    onFailedToConnect:()=>void;
    onConnectSuccesful:()=>void;
    userdata:User|null;
}
const MainComponent:React.FC<MainComponentProps> =(props)=>{
    const eventBus=useEventBus();
    const [channels,setChannels]=useState<Channel[]>(()=>{
        const storedChannels=getItemFromStorage<Channel[]>(CHANNELS);
        return storedChannels ?storedChannels: [];
    });

    const [currentChannel, setCurrentChannel] = useState<Channel | null>(() => {
        const storedCurrentChannel = localStorage.getItem('currentChannel');
        return storedCurrentChannel ? JSON.parse(storedCurrentChannel) : null;
      });
    const [subscribe,setSubscribe]=useState('');
    const [firstChatSet,setFirstChat]=useState(false);
    const [isConnected,setIsConnected]=useState(false);

    const get_url = function () {
        if (!props.userdata) {
          props.onFailedToConnect();
          return null;
        }
        const url = `${config.baseWsUrl}/ws/id/${props.userdata?.id}`;
        console.log(`Using websocket url: ${url}`);
        return url;
      };
    
      const tryConnect = function (url:string) {
        try {
        
          console.log(`Trying to connect with url: ${url}`);
          connect(url); // Replace with your WebSocket connection logic
          props.onConnectSuccesful();
          setIsConnected(true); // Mark as connected
          return true;
        } catch (error) {
          console.error('Connection error:', error);
          props.onFailedToConnect();
          setIsConnected(false); // Mark as not connected
          return false;
        }
      };
    useEffect(() => {
        console.log("inside connect effect");
        const url = get_url();
        if (url && !isConnected) {
          tryConnect(url);
        }
      }, [props.userdata]);
    useEffect(()=>{
        setItemInStorage(CHANNELS,channels);
    },[channels]);

    useEffect(()=>{
        setItemInStorage(CURRENT_CHANNEL,currentChannel);
    },[currentChannel]);


    const handleLogout=()=>{
        console.log("closing socket...");
        eventBus.publishEvent("close_socket",{});
        localStorage.removeItem("user");
        props.onLogout();
    };

    const handleSubscribe=async()=>{
        console.log("inside subscribe");
        async function onOwnSubscribeResult(ev:CustomEvent,resolve:(value: SubscribeCommandResultDto | PromiseLike<SubscribeCommandResultDto>) => void,_:(reason?: any) => void){
            console.log(`On subscribe result: ${ev.detail}`);
            eventBus.unsubscribe(SUBSCRIBE_COMMAND_RESULT,(_:any)=>{
                console.log("unsubscribed from subscribe_result");
            });
           resolve(ev.detail as SubscribeCommandResultDto);
        };
        var subscribeResult =await new Promise<SubscribeCommandResultDto>((resolve,reject)=>{
            eventBus.subscribe(SUBSCRIBE_COMMAND_RESULT,(ev:CustomEvent)=>onOwnSubscribeResult(ev,resolve,reject));
            eventBus.publishCommand({kind:SUBSCRIBE_COMMAND,topic: subscribe}as SubscribeCommand);
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
        
        if(!channels.find((channel)=>channel.id===targetChannel.id)){
            const newChannelList=[...channels,targetChannel];
            setChannels(newChannelList);
            eventBus.publishEvent(ADD_CHANNEL,targetChannel);


            if(!currentChannel|| !channels.find((channel)=>channel.id===currentChannel.id)){
                setCurrentChannel(targetChannel);
                eventBus.publishEvent(SET_CHAT,targetChannel);
                return;
            }
        }
        if(!firstChatSet){
            setFirstChat(true);
            eventBus.publishEvent(SET_CHAT,targetChannel);
        }
    }

    const handleUnsubscribe= async function(event:CustomEvent):Promise<void>{
        var channel=event.detail;
        var unsubscribeResult=await new Promise<UnsubscribeCommandResultDto>((resolve,_)=>{
            eventBus.subscribe(UNSUBSCRIBE_COMMAND_RESULT,(ev:CustomEvent)=>{
                eventBus.unsubscribe(REFRESH_CHANNELS_COMMAND_RESULT,function(_:any){
                    console.log("unsbuscribed from refresh_channels after unsubscribe from channel");
                });
                resolve(ev.detail as UnsubscribeCommandResultDto);
            });
            eventBus.publishCommand({[KIND]:UNSUBSCRIBE_COMMAND,topicId:channel.id} as UnsubscribeCommand);
        });
            var _=await handleUnsubscribeResult(unsubscribeResult); 
        };

    const handleUnsubscribeResult=async function(unsubscribeResult:UnsubscribeCommandResultDto):Promise<any>{
            console.log(unsubscribeResult);
            if(unsubscribeResult.result=="not_joined"){
                console.log("Not joined");
                return "not_joined";
            }
            if(unsubscribeResult.result!="ok"){
                var message="Could not unsubscribe from channel";
                return new Error(message);
            }
            setChannels((prevChannels: Channel[]) => {
                const newChannels = prevChannels.filter((channel) => channel.id !== unsubscribeResult.topicId);
                // Always return an array of channels, even if it's empty
                if (newChannels.length === 0) {
                  eventBus.publishEvent(RESET_CHAT, {});
                  return newChannels; // Empty array is returned
                }
                // Update the current channel if needed
                if (newChannels.every((channel) => channel.id !== unsubscribeResult.topicId)) {
                  eventBus.publishEvent(SET_CHAT, newChannels[0]);
                }
            
                eventBus.publishEvent(REMOVE_CHANNEL, { [TOPIC_ID]: unsubscribeResult.topicId });
                console.log(unsubscribeResult);
            
                return newChannels; // Ensure that a valid Channel[] is returned
              });
        };
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
            <input  id="subscribeBox" type="text" value={subscribe} onChange={(e)=>setSubscribe(e.target.value)}/>
            <label id="subscribeLabel" className="subscribeLabel" >Channel</label>
            <button id="subscribeBtn" className="subscribeButton" onClick={handleSubscribe}>Subscribe</button>
        </div> 
        <ChannelsComponent 
            channels={channels}  
            setChannels={setChannels} 
            setCurrentChannel={setCurrentChannel}
            currentChannel={currentChannel}
            handleUnsubscribe={()=>handleUnsubscribe}/>
        <ChatComponent></ChatComponent>
        <ChatSendComponent></ChatSendComponent>
    </div>
    </div>
    </>
    );
};
export default MainComponent;