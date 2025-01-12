import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useEventBus } from "../Components/EventBusContext";
import config from "../Config";
import { WebSocketController } from "./WebsocketController";
import { User } from "../Domain/User";

// Define the shape of the WebSocket state
interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  hasFailed: boolean;
}

// Extend the context to include the WebSocket state
interface WebSocketContextValue {
  controller: WebSocketController;
  state: WebSocketState;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export const WebSocketProvider: React.FC<{
  children: React.ReactNode;
  onConnectSuccessful?: () => void;
  onConnectFailed?: () => void;
  user:User|null;
}> = ({ children, onConnectSuccessful, onConnectFailed,user }) => {
  const eventBus = useEventBus();
  const controllerRef = useRef<WebSocketController | null>(null);

  // Track connection state
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    hasFailed: false,
  });

  // Initialize WebSocketController
  if (!controllerRef.current) {
    controllerRef.current = WebSocketController.getInstance(eventBus);
  }


  useEffect(() => {
    if (!user) {
      console.log("WebSocketProvider: User is not set. Skipping connection.");
      return;
    }
    setState({ isConnecting: true, isConnected: false, hasFailed: false });
    try {
      const controller = controllerRef.current;
      if (controller) {
        console.log('WebSocketProvider: Connecting WebSocket...');
        controller.connect(`${config.baseWsUrl}/ws/id/${user.id}`);
      }
  
      const handleConnected = () => {
        console.log("WebSocketProvider: Connection successful.");
        setState({ isConnecting: false, isConnected: true, hasFailed: false });
        if (onConnectSuccessful) {
          onConnectSuccessful();
        }
      };
  
      const handleConnectionFailed = () => {
        console.error("WebSocketProvider: Connection failed.");
        setState({ isConnecting: false, isConnected: false, hasFailed: true });
        if (onConnectFailed) {
          onConnectFailed();
        }
      };
  
      const handleDisconnected = () => {
        console.log("WebSocketProvider: Connection closed.");
        setState({ isConnecting: false, isConnected: false, hasFailed: false });
      };
  
      eventBus.subscribe("WEBSOCKET_CONNECTED", handleConnected);
      eventBus.subscribe("WEBSOCKET_CONNECTION_FAILED", handleConnectionFailed);
      eventBus.subscribe("WEBSOCKET_DISCONNECTED", handleDisconnected);
  
      return () => {
        console.log("WebSocketProvider: Cleaning up...");
        if (controller) {
          console.log('WebSocketProvider: Disconnecting WebSocket...');
          controller.disconnect();
        }
        eventBus.unsubscribe("WEBSOCKET_CONNECTED", handleConnected);
        eventBus.unsubscribe("WEBSOCKET_CONNECTION_FAILED", handleConnectionFailed);
        eventBus.unsubscribe("WEBSOCKET_DISCONNECTED", handleDisconnected);
      };
    } catch (error) {
      console.error("WebSocketProvider: Error during connection:", error);
      setState({ isConnecting: false, isConnected: false, hasFailed: true });
      if (onConnectFailed) {
        onConnectFailed();
      }
    }
  }, [user,onConnectSuccessful, onConnectFailed, eventBus]);
  if (!controllerRef.current) {
    throw new Error("WebSocketController is not initialized.");
  }
  return (
    <WebSocketContext.Provider value={{ controller: controllerRef.current!, state }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to access WebSocketController and connection state
export const useWebSocket = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
