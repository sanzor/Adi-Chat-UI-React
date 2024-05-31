import ChannelsComponent from "./ChannelsComponent";
import ChatComponent from "./ChatComponent";
import ChatSendComponent from "./ChatSendComponent";

export interface MainComponentProps{

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