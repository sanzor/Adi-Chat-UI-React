import { reduceEachTrailingCommentRange } from "typescript";
import { connect } from "./Websocket";

export interface ConnectButtonsPanelComponentProps{
    onConnectSuccesful():void;
    onDisconnect():void;
};

const ConnectButtonsPanelComponent:React.FC<ConnectButtonsPanelComponentProps>=(props)=>{
    const handleConnect=()=>{
        connect();
        props.onConnectSuccesful();
    };
    const handleDisconnect=()=>{
        props.onDisconnect();
    };
    return(
        <div id="connectButtonsPanel" >
                          
        <button id="connectBtn" type="button" onClick={handleConnect}>Connect</button>
        <button id="disconnectBtn" className="disconnectButton" type="button" value="Disconnect" onClick={handleDisconnect}>
            Disconnect
        </button>
        </div>

    );
};
export default ConnectButtonsPanelComponent;