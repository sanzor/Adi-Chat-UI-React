
import {WebSocketController} from "./WebsocketController";
import config from "../Config";
import { createContext, useContext, useEffect } from "react";
import webSocketConsumer from "./WebsocketConsumer";
const WebSocketContext: React.Context<WebSocketController | null> = createContext<WebSocketController | null>(null);



// Define the WebSocketContext

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize the WebSocketController
  const websocketController = new WebSocketController(config.baseWsUrl);

    useEffect(() => {
      // Connect WebSocket on mount
      try {
        websocketController.connect(config.baseWsUrl);
        console.log("WebSocketController connected");
      } catch (error) {
        console.log("Failed to connect to ws");
      }
    

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