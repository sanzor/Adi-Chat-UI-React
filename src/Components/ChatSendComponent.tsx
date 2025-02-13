import { useState } from "react";
import { PublishMessageParams } from "../Dtos/PublishMessageParams";
import { useUser } from "../Providers/UserContext";
import { useChannels } from "../Providers/ChannelContext";

interface ChatSendComponentProps{
    handleChatSend:(message:PublishMessageParams)=>void;
};


const ChatSendComponent:React.FC<ChatSendComponentProps>=({handleChatSend})=>{
    let {user}=useUser();
    const {currentChannel}=useChannels();
    const [messageText,setMessageText]=useState<string>("");
    const onChatSendClick=()=>{
        let msg:PublishMessageParams={message:messageText,topicId:currentChannel!.id,userId:user!.id};
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