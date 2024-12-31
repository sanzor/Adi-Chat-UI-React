import React, { createContext, useContext, useEffect, useRef } from "react";

import { useEventBus } from "../Components/EventBusContext";
import config from "../Config";
import { WebSocketController } from "./WebsocketController";
import { WebSocketConsumer } from "./WebsocketConsumer";

const WebSocketContext = createContext<WebSocketController | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const eventBus = useEventBus();
  const controllerRef = useRef<WebSocketController>();
  const consumerRef=useRef<WebSocketConsumer>();

  if (!controllerRef.current) {
    controllerRef.current = new WebSocketController(eventBus); // Instantiate here
  }

  const websocketController = controllerRef.current;
  if (!consumerRef.current) {
    consumerRef.current = new WebSocketConsumer(eventBus);
  }
  useEffect(() => {
    websocketController.connect(config.baseWsUrl);

    return () => {
      websocketController.disconnect();
    };
  }, [websocketController]);

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
