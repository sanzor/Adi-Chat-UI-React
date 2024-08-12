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

    return (
    <>
        <ChannelsComponent></ChannelsComponent>
        <ChatComponent></ChatComponent>
        <ChatSendComponent></ChatSendComponent>
    </>
    );
};
export default MainComponent;