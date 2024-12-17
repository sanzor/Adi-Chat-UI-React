import React, { useContext,useEffect,createContext } from "react";
import WebSocketController from "./WebsocketController";
import config from "../Config";

const WebsocketContext=createContext<WebSocketController|null>(null);

export const WebsocketProvider:React.FC<{children:React.ReactNode}>=({children})=>{
    const websocketController=new WebSocketController(config.baseWsUrl);
    useEffect(()=>{
        websocketController.connect();
        console.log("WebsocketController connected");
        return ()=>{
            websocketController.disconnect();
            console.log("WebsocketController disconnected");
        };
    },[]);
    return (<WebsocketContext.Provider value={websocketController}>
        {children}
        </WebsocketContext.Provider>});
};

