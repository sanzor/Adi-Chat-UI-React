import { useState } from "react";
import { PublishMessageParams } from "../Dtos/PublishMessageParams";
import { useUser } from "../Providers/UserContext";
import { useChat } from "../Providers/MessagesContext";
import { useSubscriptions } from "../Providers/SubscriptionsContext";

interface ChatSendComponentProps{
    handleChatSend:(message:PublishMessageParams)=>void;
};


const ChatSendComponent:React.FC<ChatSendComponentProps>=(props)=>{
    let {user}=useUser();
    const {currentChannel}=useSubscriptions();
    const [messageText,setMessageText]=useState<string>("");
    const {publishMessage}=useChat();
    const onChatSendClick=()=>{
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        let msg:PublishMessageParams={message:messageText,tempId:tempId,topicId:currentChannel!.id,userId:user!.id};
        publishMessage(msg);
    };
    return (
    <div id="chatSendMessagePanel" className="chatSendMessagePanel">
                  <button className="button" id="attachItemsBtn">+</button>
                  <input className="chatSendMessageBox" id="chatSendMessageBox" onChange={(e)=>setMessageText(e.target.value)}></input>
                  <button id="chatSendMessageBtn" className="button" type="button" onClick={onChatSendClick}>Send</button>
    </div>
    );
};

export default ChatSendComponent;