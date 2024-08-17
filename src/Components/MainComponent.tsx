import { useState } from "react";
import ChannelsComponent from "./ChannelsComponent";
import ChatComponent from "./ChatComponent";
import ChatSendComponent from "./ChatSendComponent";
import '../css/specific.css';
import '../css/general.css';
export interface MainComponentProps{
    onLogout:()=>void;
}
const MainComponent:React.FC<MainComponentProps> =()=>{
    const handleLogout=()=>{

    };

    const handleSubscribe=()=>{
        
    }
    return (
    <>
    <div id="parentPanel" className="parent">
    <div id="mainPanel">
        <button id="logoutBtn" onClick={handleLogout}>Logout</button>
        <div id="connectButtonsPanel" >            
            <button id="connectBtn" type="button">Connect</button>
            <button id="disconnectBtn" className="disconnectButton" type="button" value="Disconnect">
                Disconnect
            </button>
        </div>
        <div id="subscribeButtonPanel" className="panel">
            <input  id="subscribeBox" type="text" value=""/>
            <label id="subscribeLabel" className="subscribeLabel" >Channel</label>
            <button id="subscribeBtn" className="subscribeButton" type="button" onClick={handleSubscribe}>Subscribe</button>
        </div> 
        <ChannelsComponent></ChannelsComponent>
        <ChatComponent></ChatComponent>
        <ChatSendComponent></ChatSendComponent>
    </div></div>
    </>
    );
};
export default MainComponent;