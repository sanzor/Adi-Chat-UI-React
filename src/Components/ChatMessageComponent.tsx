import { ChatMessage } from "../Domain/ChatMessage"
import { useUser } from "../Providers/UserContext";
import "../css/chat.css";
export interface ChatMessageComponentProps{
    chatMessage:ChatMessage|null
}
const ChatMessageComponent:React.FC<ChatMessageComponentProps>=({
    chatMessage}
)=>{
    return (
    <>
    <div className="chatMessageContainer">
                                  <img className="icon chatMessageIcon"/>
                                  <div className="chatMessageMeta">{chatMessage?.created_at}</div>
                                  <div className="chatMessageContent">{chatMessage?.message}</div>
                                  <div className={chatMessage?.status}/>
                              </div>
    </>);
};
export default ChatMessageComponent;