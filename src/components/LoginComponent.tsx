import React, { Component, FC, useState } from 'react';
import { User } from '../types/User';
import { getDataAsync } from '../Utils';
import config from '../Config';
import { UserLoginParams } from '../dtos/UserLoginParams';
export interface LoginComponentProps{
    onLoginSuccess:()=>User;
    onRegister:()=>void;
};

const LoginComponent:React.FC<LoginComponentProps>=()=>{
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
   
   
    const [loginFailMessage,setLoginFailMessage]=useState('');

    async function getUserByIdAsync(Id:number):Promise<User|null>{
        var url=`${config.baseHttpUrl}/get-user?id=${Id}`;
        var result=await getDataAsync(url);
        return result;
    }
    
    async function getUserByEmailAsync():Promise<User|null>{
        var url=`${config.baseHttpUrl}/get-user-by-email?email=${email}&password=${password}`;
        var result=await getDataAsync(url);
        console.log(result);
        return result;
    
    }
    async function performLoginAsync(user:User){
        console.log("try login");
        try {
            console.log(user.id);
            var userResult=await getUserByIdAsync(user.id);
            if(userResult){
                return;
            }
            console.log("Could not log in with the user ");
           
        } catch (error) {
            console.log("Error at try login");
            
        }
       
    }
    const handleLogin=async()=>{
        var user=getItemFromStorage<User>("user");
    
        if(!user){
            setLoginFailMessage("Invalid user");
            return;
        }
        await performLoginAsync(user);
    };
    return(
    <div id="loginModal">
    <div id="loginPanel">
        <div style={{ alignSelf: 'center' }}>Login</div>
        <div className="formRow">
            <input  id="emailLoginBox" type="text" value="adriansan_93@yahoo.com"/>
            <label id="emailLoginLabel" className="subscribeLabel">Username</label>
        </div>
        <div className="formRow">
            <input id="passwordLoginBox" type="text" value="333"/>
            <label id="passwordLoginLabel" className="subscribeLabel">Password</label>
        </div>
        <div className="formRow">
            <button id="loginBtn" onClick={handleLogin}>Login</button>
            <button id="registerBtn">Register</button>
        </div>
        <div  className="formRow">
            <p id="loginFailMessage" onChange={(e)=>setLoginFailMessage(e.target.value)}>{loginFailMessage}</p>
        </div>
    </div>
</div>);
}