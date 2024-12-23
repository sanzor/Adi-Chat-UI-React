
import {WebSocketController} from "./WebsocketController";
import config from "../Config";
import { createContext, useContext, useEffect } from "react";

const WebSocketContext: React.Context<WebSocketController | null> = createContext<WebSocketController | null>(null);



// Define the WebSocketContext

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize the WebSocketController
  const websocketController = new WebSocketController(config.baseWsUrl);

  useEffect(() => {
    // Connect WebSocket on mount
    websocketController.connect();
    console.log("WebSocketController connected");

    return () => {
      // Disconnect WebSocket on unmount
      websocketController.disconnect();
      console.log("WebSocketController disconnected");
    };
  }, []);

  return (
    <WebSocketContext.Provider value={websocketController}>
        {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketController => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};