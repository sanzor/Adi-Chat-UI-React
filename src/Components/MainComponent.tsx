import { useEffect, useState } from "react";
import ChannelsComponent from "./ChannelsComponent";
import ChatComponent from "./ChatComponent";
import ChatSendComponent from "./ChatSendComponent";
import '../css/specific.css';
import '../css/general.css';
import { SubscribeCommandResultDto } from "../Dtos/SocketCommandResults/SubscribeCommandResultDto";
import { ADD_CHANNEL, GET_NEWEST_MESSAGES_COMMAND, GET_NEWEST_MESSAGES_COMMAND_RESULT, NEW_INCOMING_MESSAGE, PUBLISH_MESSAGE_COMMAND, REFRESH_CHANNELS_COMMAND_RESULT, REMOVE_CHANNEL, RESET_CHAT, SET_CHAT, SOCKET_CLOSED, SUBSCRIBE_COMMAND, SUBSCRIBE_COMMAND_RESULT_COMPONENT, UNSUBSCRIBE_COMMAND, UNSUBSCRIBE_COMMAND_RESULT } from "../Events";
import { useEventBus } from "./EventBusContext";
import { CHANNELS, CURRENT_CHANNEL, KIND, MESSAGES, TOPIC_ID } from "../Constants";
import { SubscribeCommand } from "../Domain/Commands/SubscribeCommand";
import { getDataAsync, getItemFromStorage, setItemInStorage } from "../Utils";
import { Channel } from "../Domain/Channel";
import { UnsubscribeCommandResultDto } from "../Dtos/SocketCommandResults/UnsubscrirbeCommandResultDto";
import { UnsubscribeCommand } from "../Domain/Commands/UnsubscribeCommand";
import { User } from "../Domain/User";
import config from "../Config";
import { GetUserSubscriptionsResult } from "../Dtos/GetUserSubscriptionsResult";
import { GetNewestMessagesResult } from "../Dtos/GetNewestMessagesResult";
import { ChatMessage } from "../Domain/ChatMessage";
import { GetNewestMessagesCommand } from "../Domain/Commands/GetNewestMessagesCommand";
import { PublishMessageCommand } from "../Domain/Commands/PublishMessageCommand";
import { PublishMessageParams } from "../Dtos/PublishMessageParams";
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
    const [messagesByChannel, setMessagesByChannel] = useState<Record<string, ChatMessage[]>>(() => {
      const storedMessages = getItemFromStorage<Record<string, ChatMessage[]>>(MESSAGES);
      return storedMessages ? storedMessages : {};
    });
    const [subscribe,setSubscribe]=useState('');
    const [firstChatSet,setFirstChat]=useState(false);

    const [currentChannel, setCurrentChannel] = useState<Channel | null>(() => {
        const storedCurrentChannel = localStorage.getItem(CURRENT_CHANNEL);
        return storedCurrentChannel ? JSON.parse(storedCurrentChannel) : null;
      });
    useEffect(()=>{
        fetchChannels();
        channels.map(channel=>{
          let command:GetNewestMessagesCommand={topicId:channel.id,count:10,kind:GET_NEWEST_MESSAGES_COMMAND};
          eventBus.publishCommand(command);
          return channel;
        });
    },[]);

    const fetchChannels=async()=>{
      try {
        var fetchedChannelsResult:GetUserSubscriptionsResult=await getChannels();
        console.log("Stored Channels:", fetchedChannelsResult.subscriptions);
        setItemInStorage(CHANNELS,fetchedChannelsResult.subscriptions);
        setChannels(prevChannels => {
          console.log("Previous Channels:", prevChannels);
          console.log("New Channels:", fetchedChannelsResult.subscriptions);
          return [...fetchedChannelsResult.subscriptions];
      });
      } catch (error) {
        console.error("Error fetching channels:", error);
      }
    };
 // Dependencies to ensure the effect re-runs if `userdata` changes // Only re-run when `userdata` changes
    useEffect(()=>{
        setItemInStorage(CHANNELS,channels);
        console.log(channels);
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

      //#region message
      // s
      useEffect(()=>{
        const handleNewMessage=(event:CustomEvent)=>{
          const newMessage:ChatMessage=event.detail;
          setMessagesByChannel(prev=>{
             const updatedMessages={
              ...prev,
              [newMessage.topicId]:[...(prev[newMessage.topicId]||[])],
             };
             setItemInStorage(MESSAGES,updatedMessages);
             return updatedMessages;
          });
        }
        eventBus.subscribe(NEW_INCOMING_MESSAGE,handleNewMessage);
        return ()=>{
            eventBus.unsubscribe(NEW_INCOMING_MESSAGE,handleNewMessage);
        }
    },[eventBus]);
    const handleGetNewestMessagesForChannel=(event:CustomEvent)=>{
      const newEstMessages:GetNewestMessagesResult=event.detail;
      setMessagesByChannel(prev=>{
         const updatedMessages={
           ...prev,
            [newEstMessages.channelId]:newEstMessages.messages??[]
         };
         setItemInStorage(MESSAGES,updatedMessages);
         return updatedMessages;
      });
  }
    useEffect(()=>{
       eventBus.subscribe(GET_NEWEST_MESSAGES_COMMAND_RESULT,handleGetNewestMessagesForChannel);
       return ()=>{
          eventBus.unsubscribe(GET_NEWEST_MESSAGES_COMMAND_RESULT,handleGetNewestMessagesForChannel);
       }
    });
      //#endregion
   
    const handleLogout=()=>{
        console.log("closing socket...");
        eventBus.publishEvent(SOCKET_CLOSED,{});
        localStorage.removeItem("user");
        props.onLogout();
    };


    const handleSubscribe=async()=>{
      try {
        console.log("inside subscribe");
        const subscribeResult = await new Promise<SubscribeCommandResultDto>((resolve, reject) => {
          // Define the callback
          const onOwnSubscribeResult = (ev: CustomEvent) => {
            console.log(`On own subscribe result: ${JSON.stringify(ev.detail)}`);
            eventBus.unsubscribe(SUBSCRIBE_COMMAND_RESULT_COMPONENT, onOwnSubscribeResult); // Unsubscribe using the same reference
            resolve(ev.detail as SubscribeCommandResultDto);
          };
          // Subscribe to the event
          console.log("Subscribing to SUBSCRIBE_COMMAND_RESULT_COMPONENT...");
          eventBus.subscribe(SUBSCRIBE_COMMAND_RESULT_COMPONENT, onOwnSubscribeResult);
          // Publish the command
          eventBus.publishCommand({
            kind: SUBSCRIBE_COMMAND,
            topic: subscribe,
          } as SubscribeCommand);
        });
    
        // Process the result
        const _ = await handleSubscribeResultAsync(subscribeResult);
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
          console.log(updatedChannels);
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
    const handleUnsubscribe = async (channel: Channel): Promise<void> => {
       
        console.log("Triggering unsubscribe");
        console.log(channel);
        setChannels((prevChannels) => prevChannels.filter((c) => c.id !== channel.id));

        try {
          const unsubscribeResult = await new Promise<UnsubscribeCommandResultDto>((resolve, reject) => {
            // Subscribe to the UNSUBSCRIBE_COMMAND_RESULT event
            const onUnsubscribeResult = (ev: CustomEvent) => {
              eventBus.unsubscribe(REFRESH_CHANNELS_COMMAND_RESULT, onUnsubscribeResult);
              resolve(ev.detail as UnsubscribeCommandResultDto);
            };
      
            eventBus.subscribe(UNSUBSCRIBE_COMMAND_RESULT, onUnsubscribeResult);
            let command={
              kind: UNSUBSCRIBE_COMMAND,
              topicId: Number(channel.id),
            } as UnsubscribeCommand
            // Publish the UNSUBSCRIBE command
            eventBus.publishCommand(command);
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
    const handleChatSend=(newMessage:PublishMessageParams)=>{
        eventBus.publishCommand({message:newMessage,kind:PUBLISH_MESSAGE_COMMAND} as PublishMessageCommand)
    }
    return (
    <>
    {/* <div id="parentPanel" className="parent"> */}
    <div id="mainPanel" className="mainPanel">
        <button id="logoutBtn" onClick={handleLogout}>Logout</button>
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
            handleUnsubscribe={handleUnsubscribe}/>
        <ChatComponent currentChannel={currentChannel} messages={messagesByChannel[currentChannel?.id??""]}></ChatComponent>
        <ChatSendComponent handleChatSend={handleChatSend}></ChatSendComponent>
    </div>
    {/* </div> */}
    </>
    );
};
export default MainComponent;