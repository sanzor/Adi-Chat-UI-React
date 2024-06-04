interface ChatSendComponentProps{

};


const ChatSendComponent:React.FC<ChatSendComponentProps>=(props)=>{
    return (
    <div id="chatSendMessagePanel" className="chatSendMessagePanel">
                  <button className="button" id="attachItemsBtn">+</button>
                  <input className="chatSendMessageBox" id="chatSendMessageBox" ></input>
                  <button id="chatSendMessageBtn" className="button" type="button">Send</button>
    </div>
    );
};

export default ChatSendComponent;