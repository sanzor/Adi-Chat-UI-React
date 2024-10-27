import React from 'react';
import logo from './logo.svg';
import './App.css';
import ParentComponent from './Components/ParentComponent';
import { WebSocketProvider } from './Components/WebsocketContext';
import { EventBusProvider } from './Components/EventBusContext';

const  App:React.FC=()=> {
  return (
    <WebSocketProvider>
    <EventBusProvider>
       <div className="App">
        <ParentComponent />
      </div>
    </EventBusProvider>
    </WebSocketProvider>
   
  );
}

export default App;
