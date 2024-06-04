import React, { createContext, useContext, useEffect, ReactNode, useCallback } from 'react';
import { connect, closeSocket, sendCommand } from '../sock'; // Adjust the import path as needed
import EventBus from './EventBus';
import { Command } from '../Domain/Commands/Command';

interface WebSocketContextType {
  send: (command: Command) => void;
  subscribe: (event: string, callback: (data: any) => void) => void;
  unsubscribe: (event: string, callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {


  const send = useCallback((command: Command) => {
    sendCommand(command);
  }, []);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    EventBus.subscribe(event, callback);
  }, []);

  const unsubscribe = useCallback((event: string, callback: (data: any) => void) => {
    EventBus.unsubscribe(event, callback);
  }, []);

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
