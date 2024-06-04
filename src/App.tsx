import React from 'react';
import logo from './logo.svg';
import './App.css';
import ParentComponent from './Components/ParentComponent';
import { WebSocketProvider } from './Components/WebsocketContext';

const  App:React.FC=()=> {
  return (
    <WebSocketProvider>
       <div className="App">
      <ParentComponent />
    </div>
    </WebSocketProvider>
   

  );
}

export default App;
