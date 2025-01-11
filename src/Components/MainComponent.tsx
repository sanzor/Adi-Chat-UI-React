import { useEffect, useState } from "react";
import ChannelsComponent from "./ChannelsComponent";
import ChatComponent from "./ChatComponent";
import ChatSendComponent from "./ChatSendComponent";
import '../css/specific.css';
import '../css/general.css';
import { SubscribeCommandResultDto } from "../Dtos/SocketCommandResults/SubscribeCommandResultDto";
import { ADD_CHANNEL, REFRESH_CHANNELS_COMMAND_RESULT, REMOVE_CHANNEL, RESET_CHAT, SET_CHAT, SOCKET_CLOSED, SUBSCRIBE_COMMAND, SUBSCRIBE_COMMAND_RESULT, SUBSCRIBE_COMMAND_RESULT_COMPONENT, UNSUBSCRIBE_COMMAND, UNSUBSCRIBE_COMMAND_RESULT } from "../Events";
import { useEventBus } from "./EventBusContext";
import { CHANNELS, CURRENT_CHANNEL, KIND, TOPIC_ID } from "../Constants";
import { SubscribeCommand } from "../Domain/Commands/SubscribeCommand";
import { getItemFromStorage, setItemInStorage } from "../Utils";
import { Channel } from "../Domain/Channel";
import { UnsubscribeCommandResultDto } from "../Dtos/SocketCommandResults/UnsubscrirbeCommandResultDto";
import { UnsubscribeCommand } from "../Domain/Commands/UnsubscribeCommand";
import { User } from "../Domain/User";
export interface MainComponentProps{
    onLogout:()=>void;
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
 // Dependencies to ensure the effect re-runs if `userdata` changes // Only re-run when `userdata` changes
    useEffect(()=>{
        setItemInStorage(CHANNELS,channels);
    },[channels]);

    useEffect(()=>{
        setItemInStorage(CURRENT_CHANNEL,currentChannel);
    },[currentChannel]);

    useEffect(() => {
        const handleAddChannel = (channel: Channel) => {
          // Use the latest channelsRef value to check for duplicates
          if (!channels.find((c) => c.id === channel.id)) {
            const newChannelList = [...channels, channel];
            setChannels(newChannelList);
          }
        };
        eventBus.subscribe(ADD_CHANNEL, handleAddChannel);
        return () => {
          eventBus.unsubscribe(ADD_CHANNEL, handleAddChannel);
        };
      }, [eventBus, channels]); 
      
    const handleLogout=()=>{
        console.log("closing socket...");
        eventBus.publishEvent(SOCKET_CLOSED,{});
        localStorage.removeItem("user");
        props.onLogout();
    };

    const handleSubscribe=async()=>{
      try {
        console.log("inside subscribe");
        async function onOwnSubscribeResult(ev:CustomEvent,resolve:(value: SubscribeCommandResultDto | PromiseLike<SubscribeCommandResultDto>) => void,_:(reason?: any) => void){
            console.log(`On subscribe result: ${ev.detail}`);
            eventBus.unsubscribe(SUBSCRIBE_COMMAND_RESULT_COMPONENT,(_:any)=>{
                console.log("unsubscribed from subscribe_result");
            });
           resolve(ev.detail as SubscribeCommandResultDto);
        };
        var subscribeResult =await new Promise<SubscribeCommandResultDto>((resolve,reject)=>{
            eventBus.subscribe(SUBSCRIBE_COMMAND_RESULT_COMPONENT,(ev:CustomEvent)=>onOwnSubscribeResult(ev,resolve,reject));
            eventBus.publishCommand({kind:SUBSCRIBE_COMMAND,topic: subscribe}as SubscribeCommand);
        });
        var _=await handleSubscribeResultAsync(subscribeResult);
      } catch (error) {
        console.error("Subscription failed:", error);
      }
       
    };
    const handleSubscribeResultAsync = (subscribeResult: SubscribeCommandResultDto): void | Error => {
        console.log(`Subscription result: ${subscribeResult.result}`);
      
        // Handle unsuccessful subscription
        if (subscribeResult.result !== "ok" && subscribeResult.result !== "already_subscribed") {
          const errorMessage = `Could not subscribe to channel: ${subscribe}`;
          console.error(errorMessage);
          return new Error(errorMessage);
        }
      
        // Handle already subscribed case
        if (subscribeResult.result === "already_subscribed") {
          console.log("Already subscribed to the channel.");
          return;
        }
      
        // Extract target channel details
        const targetChannel: Channel = {
          id: subscribeResult.topic!.id,
          name: subscribeResult.topic!.name,
        };
      
        // Add the channel to the state if it's new
        if (!channels.find((channel) => channel.id === targetChannel.id)) {
          const updatedChannels = [...channels, targetChannel];
          setChannels(updatedChannels);
          eventBus.publishEvent(ADD_CHANNEL, targetChannel);
      
          // Set the current channel if no current channel is set
          if (!currentChannel || !channels.find((channel) => channel.id === currentChannel.id)) {
            setCurrentChannel(targetChannel);
            eventBus.publishEvent(SET_CHAT, targetChannel);
            return;
          }
        }
      
        // Set the first chat if it's not set yet
        if (!firstChatSet) {
          setFirstChat(true);
          eventBus.publishEvent(SET_CHAT, targetChannel);
        }
      };
    const handleUnsubscribe = async (event: CustomEvent): Promise<void> => {
        const channel = event.detail;
        setChannels((prevChannels) => prevChannels.filter((c) => c.id !== channel.id));
        try {
          const unsubscribeResult = await new Promise<UnsubscribeCommandResultDto>((resolve, reject) => {
            // Subscribe to the UNSUBSCRIBE_COMMAND_RESULT event
            const onUnsubscribeResult = (ev: CustomEvent) => {
              eventBus.unsubscribe(REFRESH_CHANNELS_COMMAND_RESULT, onUnsubscribeResult);
              resolve(ev.detail as UnsubscribeCommandResultDto);
            };
      
            eventBus.subscribe(UNSUBSCRIBE_COMMAND_RESULT, onUnsubscribeResult);
      
            // Publish the UNSUBSCRIBE command
            eventBus.publishCommand({
              [KIND]: UNSUBSCRIBE_COMMAND,
              topicId: channel.id,
            } as UnsubscribeCommand);
          });
      
          // Handle the unsubscribe result
          await handleUnsubscribeResult(unsubscribeResult);
        } catch (error) {
          console.error("Unsubscription failed:", error);
        }
      };

      const handleUnsubscribeResult = async (unsubscribeResult: UnsubscribeCommandResultDto): Promise<void> => {
        console.log(`Unsubscribe result: ${unsubscribeResult.result}`);
      
        // Handle unsuccessful unsubscription
        if (unsubscribeResult.result === "not_joined") {
          console.warn("Cannot unsubscribe: not joined to the channel.");
          return;
        }
      
        if (unsubscribeResult.result !== "ok") {
          const errorMessage = "Could not unsubscribe from channel.";
          console.error(errorMessage);
          throw new Error(errorMessage);
        }
      
        // Remove the channel from the list
        setChannels((prevChannels: Channel[]) => {
          const updatedChannels = prevChannels.filter((channel) => channel.id !== unsubscribeResult.topicId);
      
          // If there are no channels left, reset the chat
          if (updatedChannels.length === 0) {
            eventBus.publishEvent(RESET_CHAT, {});
            return [];
          }
      
          // Update the current channel if necessary
          if (currentChannel && currentChannel.id === unsubscribeResult.topicId) {
            setCurrentChannel(updatedChannels[0]); // Set to the first channel in the updated list
            eventBus.publishEvent(SET_CHAT, updatedChannels[0]);
          }
      
          eventBus.publishEvent(REMOVE_CHANNEL, { [TOPIC_ID]: unsubscribeResult.topicId });
          console.log("Channel removed:", unsubscribeResult.topicId);
      
          return updatedChannels;
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