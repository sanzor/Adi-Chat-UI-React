import { useEffect } from "react";
import { SUBSCRIBE_COMMAND_RESULT_U,
         UNSUBSCRIBE_COMMAND_RESULT_U,
         REFRESH_CHANNELS_COMMAND_RESULT,
         NEW_INCOMING_MESSAGE,
         UNSUBSCRIBE_BUTTON_CLICK,
         CHANNEL_CLICK
} from "../Events";
import '../css/specific.css';
import '../css/general.css';
import '../css/channels.css';
import EventBus from "./EventBus";
export interface ChannelsComponentProps{

}
const ChannelsComponent:React.FC<ChannelsComponentProps>=(props)=>{

    useEffect(()=>{
        EventBus.subscribe(SUBSCRIBE_COMMAND_RESULT_U,()=>{});//onSubscribeResultU);
    },[]);
    
    return(
    <>
       <div id="channelsPanel" className="channelsPanel">
                  <label id="channelsLabel">Channels</label>
                  <div id="channelsAreaPanel">
                          <div id="channelsContainer" className="chatScroll"></div>
                  </div>
        </div>
    </>
    )
}

export default ChannelsComponent;