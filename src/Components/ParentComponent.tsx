import React,{useState,FC, useEffect} from "react";
import LoginComponent from "./LoginComponent";
import { User } from "../Domain/User";
import RegisterComponent from "./RegisterComponent";
import { getItemFromStorage, setItemInStorage } from "../Utils";
import MainComponent from "./MainComponent";
import '../css/specific.css';
import '../css/general.css';
import '../css/chat.css';
import '../css/channels.css'
import { useEventBus } from "./EventBusContext";
export interface ParentComponentProps{

};
enum VIEWSTATE{
    LOGIN='login',
    REGISTER='register',
    MAIN='main'
}
const ParentComponent:FC<ParentComponentProps>=(props)=>{
    const [user,setUser]=useState<User|null>(null);
    const [viewstate,setViewState]=useState<VIEWSTATE>(VIEWSTATE.LOGIN);
    useEffect(()=>{
        const storedUser=getItemFromStorage<User>('user');
        console.log(storedUser);
        if(storedUser){
            setUser(storedUser);
            setViewState(VIEWSTATE.MAIN)
        }else{
            setViewState(VIEWSTATE.LOGIN)
        }
    },[]);
   
    const handleLoginSuccessful=(user:User):void=>{
        console.log(`Login succesful..Setting user to :${user}`);
        setUser(user);
        setItemInStorage<User>('user',user);
        setViewState(VIEWSTATE.MAIN)
    };
    const handleRegisterSuccessful=(user:User):void=>{
        setUser(user);
        setViewState(VIEWSTATE.MAIN)

    }
    const handleBackToLogin=()=>{
        setViewState(VIEWSTATE.LOGIN)
    }
    const handleLogout=()=>{
        setUser(null);
        setViewState(VIEWSTATE.LOGIN)
    };
    const handleConnectSuccessful=():void=>{

    };
    const handleConnectFailed=():void=>{

    };
    return(<>
            {viewstate===VIEWSTATE.LOGIN && 
            <LoginComponent 
                    onRegister={()=>setViewState(VIEWSTATE.REGISTER)} 
                    onLoginSuccess={handleLoginSuccessful}
                    userdata={user}/>}
            
            {viewstate===VIEWSTATE.REGISTER && 
             <RegisterComponent
                     onRegisterSuccess={handleRegisterSuccessful}
                     onBackToLogin={handleBackToLogin}/>
             }
             {viewstate===VIEWSTATE.MAIN &&
             <MainComponent 
                            onConnectSuccesful={handleConnectSuccessful}
                            onFailedToConnect={handleConnectFailed}
                            onLogout={handleLogout} 
                            userdata={user}/>}
             </>);
};

export default ParentComponent;