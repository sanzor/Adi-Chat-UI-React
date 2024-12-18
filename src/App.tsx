import React from 'react';
import logo from './logo.svg';
import './App.css';
import ParentComponent from './Components/ParentComponent';
import { EventBusProvider } from './Components/EventBusContext';
import "./Websocket/WebsocketController";
const  App:React.FC=()=> {
  return (
    <EventBusProvider>
       <div className="App">
        <ParentComponent />
      </div>
    </EventBusProvider>
   
  );
}

export default App;
