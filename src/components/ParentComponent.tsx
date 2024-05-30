import React,{useState,FC} from "react";
import LoginComponent from "./LoginComponent";
import { User } from "../types/User";
import RegisterComponent from "./RegisterComponent";
export interface ParentComponentProps{

};
const ParentComponent:FC<ParentComponentProps>=(props)=>{
    const [user,setUser]=useState(()=>{
        
    });
    const [showLogin,setShowLogin]=useState(true);
    const [showRegister,setShowRegister]=useState(false);
    const handleShowLogin=()=>{
        setShowLogin(true);
        setShowRegister(false);
    };
    const handleShowRegister=()=>{
        setShowRegister(true);
        setShowLogin(false);
    };
    const handleLoginSuccessful=(user:User):User=>{
        return {email:"a",id:1,name:"sa"};
    };
    const handleRegisterSuccessful=(user:User)=>{

    }
    const handleBackToLogin=()=>{
        handleShowLogin();
    }
    return(<>{showLogin && 
            <LoginComponent 
                    onRegister={handleShowRegister} 
                    onLoginSuccess={(user)=>handleLoginSuccessful(user)}
                    userdata={null}>
            </LoginComponent>}
             {showRegister && 
             <RegisterComponent
                     onRegisterSuccess={handleRegisterSuccessful}
                     onBackToLogin={handleBackToLogin}>
             </RegisterComponent>
             }</>)
};

export default ParentComponent;