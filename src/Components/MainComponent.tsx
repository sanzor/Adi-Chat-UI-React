import { useState } from "react";
import ChannelsComponent from "./ChannelsComponent";
import ChatComponent from "./ChatComponent";
import ChatSendComponent from "./ChatSendComponent";
import '../css/specific.css';
import '../css/general.css';
import { PUBLISH_MESSAGE_COMMAND,
   SOCKET_CLOSED } from "../Events";
import { useEventBus } from "../Providers/EventBusContext";
import { PublishMessageCommand } from "../Domain/Commands/PublishMessageCommand";
import { PublishMessageParams } from "../Dtos/PublishMessageParams";
import { ChatActionsProvider } from "../Providers/ChatActionsContext";
import ErrorBoundary from "./ErrorBoundary";
import { useSubscriptions } from "../Providers/SubscriptionsContext";
export interface MainComponentProps{
    onLogout:()=>void;
}
const MainComponent:React.FC<MainComponentProps> =(props)=>{
  const eventBus = useEventBus();
  const [subscribe, setSubscribe] = useState("");
  const { subscribeToChannel } = useSubscriptions(); 
   
    const handleLogout=()=>{
        console.log("closing socket...");
        eventBus.publishEvent(SOCKET_CLOSED,{});
        localStorage.removeItem("user");
        props.onLogout();
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
            <button id="subscribeBtn" className="subscribeButton" onClick={() => subscribeToChannel(subscribe)}>Subscribe</button>
        </div> 
        <ErrorBoundary>
        <ChatActionsProvider>
          <ChannelsComponent/>
          <ChatComponent></ChatComponent>
          <ChatSendComponent handleChatSend={handleChatSend}></ChatSendComponent>
        </ChatActionsProvider>
        </ErrorBoundary>
    </div>
    {/* </div> */}
    </>
    );
};
export default MainComponent;