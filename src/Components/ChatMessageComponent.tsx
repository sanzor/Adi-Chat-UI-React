import { ChatMessage } from "../Domain/ChatMessage"
import { useUser } from "../Providers/UserContext";
import "../css/chat.css";
export enum ChatMessageStatus{
    Pending=0,
    Sent=1,
    Seen=2
}
export interface ChatMessageComponentProps{
    chatMessage:ChatMessage|null
    status:ChatMessageStatus
}
const ChatMessageComponent:React.FC<ChatMessageComponentProps>=({
    chatMessage,status}
)=>{
    const {user}=useUser();
    return (
    <>
    <div className="chatMessageContainer">
                                  <img className="icon chatMessageIcon"/>
                                  <div className="chatMessageMeta">{chatMessage?.created_at}</div>
                                  <div className="chatMessageContent">{chatMessage?.message}</div>
                                  <div className={ChatMessageStatus[status]}/>
                              </div>
    </>);
};
export default ChatMessageComponent;