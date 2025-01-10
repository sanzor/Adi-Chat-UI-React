import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../App';
// import '../css/index.css';
// import '../css/general.css';
// import '../css/specific.css';
const container=document.getElementById('root');

if(container){
    const root=createRoot(container);
    root.render(
        // <React.StrictMode>
           <App></App>
        // </React.StrictMode>
    )
}