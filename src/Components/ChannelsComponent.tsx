import { useEffect } from "react";
import { subscribeToEvent } from "../bus";
import { SUBSCRIBE_COMMAND_RESULT_U,
         UNSUBSCRIBE_COMMAND_RESULT_U,
         REFRESH_CHANNELS_COMMAND_RESULT,
         NEW_INCOMING_MESSAGE,
         UNSUBSCRIBE_BUTTON_CLICK,
         CHANNEL_CLICK
} from "../events";
export interface ChannelsComponentProps{

}
const ChannelsComponent:React.FC<ChannelsComponentProps>=(props)=>{

    useEffect(()=>{
        subscribeToEvent(SUBSCRIBE_COMMAND_RESULT_U,onSubscribeResultU);
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