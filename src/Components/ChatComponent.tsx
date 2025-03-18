import "../css/chat.css"
import { useChatActions } from "../Providers/ChatActionsContext";
import { useSubscriptions } from "../Providers/SubscriptionsContext";
import ChatMessageComponent from "./ChatMessageComponent";

const ChatComponent:React.FC=()=>{
    const { messagesMap } = useChatActions(); // ✅ Get messages from ChatProvider
    const { currentChannel } = useSubscriptions(); // ✅ Get current channel
    const messages = messagesMap?.get(currentChannel?.id ?? 0) || [];
    return(
    <>
       <div id="chatPanel" className="chatPanel">
                          <div className="currentChannelNamePanel" id="currentChannelNamePanel">
                              <label id="currentChannelNameLabel" className="currentChannelNameLabel" >{currentChannel?.name}</label>
                          </div>
                         <div id="messagesContainer" className="chatScroll">
                              <button id="loadOlderMessagesBtn"> Load older messages</button>
                              {Array.isArray(messages) && messages.map(msg => (
                                    <ChatMessageComponent 
                                        key={msg.id || msg.tempId}
                                        chatMessage={msg} 
                                    />
                                ))}
                         </div>
        </div>
    </>
    )
}

export default ChatComponent;