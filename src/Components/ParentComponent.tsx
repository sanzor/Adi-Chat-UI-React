import React,{useState,FC, useEffect} from "react";
import LoginComponent from "./LoginComponent";
import { User } from "../Domain/User";
import RegisterComponent from "./RegisterComponent";
import { getItemFromStorage, setItemInStorage } from "../Utils";
import MainComponent from "./MainComponent";
export interface ParentComponentProps{

};
const ParentComponent:FC<ParentComponentProps>=(props)=>{
    const [user,setUser]=useState<User|null>(null);
    const [showLogin,setShowLogin]=useState(true);
    const [showRegister,setShowRegister]=useState(false);
    const [showMain,setShowMain]=useState(false);

    useEffect(()=>{
        const storedUser=getItemFromStorage<User>('user');
        if(storedUser){
            setUser(storedUser);
        }
    },[]);
    const handleShowLogin=()=>{
        setShowLogin(true);
        setShowRegister(false);
        setShowMain(false);
    };
    const handleShowRegister=()=>{
        setShowRegister(true);
        setShowLogin(false);
        setShowMain(false);
    };
    const handleShowMain=()=>{
        setShowLogin(false);
        setShowMain(true);
    }
    const handleLoginSuccessful=(user:User):void=>{
        setUser(user);
        setItemInStorage<User>('user',user);
        handleShowMain();
    };
    const handleRegisterSuccessful=(user:User):void=>{
        setUser(user);
        handleShowMain();

    }
    const handleBackToLogin=()=>{
        handleShowLogin();
    }
    const handleLogout=()=>{
        handleShowLogin();
    };
    return(<>{showLogin && 
            <LoginComponent 
                    onRegister={handleShowRegister} 
                    onLoginSuccess={handleLoginSuccessful}
                    userdata={user}/>
           }
             {showRegister && 
             <RegisterComponent
                     onRegisterSuccess={handleRegisterSuccessful}
                     onBackToLogin={handleBackToLogin}/>
             }
             {showMain &&
             <MainComponent onLogout={handleLogout}/>}
             </>);
};

export default ParentComponent;