export interface ChatComponentProps{

}
const ChatComponent:React.FC<ChatComponentProps>=(props)=>{
    return(
    <>
       <div id="chatPanel" className="chatPanel">
                          <div className="currentChannelNamePanel" id="currentChannelNamePanel">
                              <label id="currentChannelNameLabel" className="currentChannelNameLabel" >Channel 1</label>
                          </div>
                         <div id="messagesContainer" className="chatScroll">
                              <button id="loadOlderMessagesBtn"> Load older messages</button>
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
                         </div>
        </div>
    </>
    )
}

export default ChatComponent;