import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { connect,disconnect } from './Websocket'; // Adjust the import path as needed


interface WebSocketContextType {
  connect: () => void;
  disconnect : ()=> void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const disconnectWebsocket=useCallback((event:Event,callback:(data:any)=>void)=>{
      disconnect();
  },[]);
  
  
  
  return (
    <WebSocketContext.Provider value={{connect,disconnect }}>
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
