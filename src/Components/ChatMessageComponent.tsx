import { ChatMessage } from "../Domain/ChatMessage"
import "../css/chat.css"
export interface ChatMessageComponentProps{
    chatMessage:ChatMessage|null;
}
const ChatMessageComponent:React.FC<ChatMessageComponentProps>=({
    chatMessage}
)=>{
    
    return (
    <>
    <div className="chatMessageContainer">
                                  <img className="icon chatMessageIcon"/>
                                  <div className="chatMessageMeta"> 12:32 GMT +2 </div>
                                  <div className="chatMessageContent">sugi pwla cu dan voiculescu</div>
                                  <div className="chatMessageStatus">
                                      <div className="chatMessageStatusPending">tick</div>
                                      <div className="chatMessageStatusSent">tick</div>
                                      <div className="chatMessageStatusSeen">tick</div>
                                  </div>
                              </div>
    </>);
};
export default ChatMessageComponent;