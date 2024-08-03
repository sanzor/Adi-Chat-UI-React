import React from 'react';
import logo from './logo.svg';
import './App.css';
import ParentComponent from './Components/ParentComponent';
import { WebSocketProvider } from './Components/WebsocketContext';

const  App:React.FC=()=> {
  return (
       <div className="App">
        <ParentComponent />
      
    </div>
   
  );
}

export default App;
