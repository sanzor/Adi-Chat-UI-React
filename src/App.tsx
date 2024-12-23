import React from 'react';
import logo from './logo.svg';
import './App.css';
import ParentComponent from './Components/ParentComponent';
import { EventBusProvider } from './Components/EventBusContext';
import "./Websocket/WebsocketController";
import { WebSocketProvider } from './Websocket/WebsocketContext';
const  App:React.FC=()=> {
  return (
    <EventBusProvider>
      <WebSocketProvider>
      <div className="App">
        <ParentComponent />
      </div>
      </WebSocketProvider>
       
    </EventBusProvider>
   
  );
}

export default App;
