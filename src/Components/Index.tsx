import React from 'react';
import { createRoot } from 'react-dom/client';
import ParentComponent from './ParentComponent';

const container=document.getElementById('root');

if(container){
    const root=createRoot(container);
    root.render(
        <React.StrictMode>
            <ParentComponent></ParentComponent>
        </React.StrictMode>
    )
}