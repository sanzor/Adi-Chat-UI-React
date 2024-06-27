import React, { createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import { connect,disconnect } from './Websocket'; // Adjust the import path as needed
import EventBus from './EventBus';
import { Command } from '../Domain/Commands/Command';


interface WebSocketContextType {
  connect(): () => void;
  disconnect : ()=> void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const disconnectWebsocket=useCallback((event:Event,callback:(data:any)=>void)=>{
      disconnect();
  },[]);

  
  return (
    <WebSocketContext.Provider value={{ send, subscribe, unsubscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
