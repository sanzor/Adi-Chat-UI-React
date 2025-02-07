import { useEffect } from "react";
import "../css/chat.css"
import { Channel } from "../Domain/Channel";
import { ChatMessage } from "../Domain/ChatMessage";
import ChatMessageComponent, { ChatMessageStatus } from "./ChatMessageComponent";
export interface ChatComponentProps{
    currentChannel:Channel|null;
    messages:ChatMessage[];
}
const ChatComponent:React.FC<ChatComponentProps>=({currentChannel,messages})=>{
        useEffect(()=>{
            
        },[messages]);
    return(
    <>
       <div id="chatPanel" className="chatPanel">
                          <div className="currentChannelNamePanel" id="currentChannelNamePanel">
                              <label id="currentChannelNameLabel" className="currentChannelNameLabel" >{currentChannel?.name}</label>
                          </div>
                         <div id="messagesContainer" className="chatScroll">
                              <button id="loadOlderMessagesBtn"> Load older messages</button>
                              {Array.isArray(messages) && messages.map(msg=>(
                                <ChatMessageComponent chatMessage={msg} status={ChatMessageStatus.Pending}>

                              </ChatMessageComponent>))}
                         </div>
        </div>
    </>
    )
}

export default ChatComponent;