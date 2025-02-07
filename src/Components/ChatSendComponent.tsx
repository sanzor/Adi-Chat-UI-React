import { useState } from "react";
import { Channel } from "../Domain/Channel";
import { ChatMessage } from "../Domain/ChatMessage";
import { User } from "../Domain/User";

interface ChatSendComponentProps{
    current_channel:Channel
    handleChatSend:(message:ChatMessage)=>void;
    current_user:User
};


const ChatSendComponent:React.FC<ChatSendComponentProps>=({handleChatSend,current_channel,current_user})=>{
    const [messageText,setMessageText]=useState<string>("");
    const onChatSendClick=()=>{
        let msg:ChatMessage={message:messageText,topicId:current_channel.id,userId:current_user.id};
        handleChatSend(msg);
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