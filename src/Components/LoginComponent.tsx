import React, {  useState } from 'react';
import { User } from '../Domain/User';
import { getDataAsync } from '../Utils';
import config from '../Config';
import { LoginUserData } from '../Dtos/LoginUserData';
import '../css/general.css';
import '../css/specific.css';
export interface LoginComponentProps{
    onLoginSuccess:(User:User)=>void;
    onRegister:()=>void;
    userdata:User|null;
};

const LoginComponent:React.FC<LoginComponentProps>=(props)=>{
    const [email,setEmail]=useState('adriansan_93@yahoo.com');
    const [password,setPassword]=useState('pwd1');
    const [loginFailMessage,setLoginFailMessage]=useState('');

    async function getUserByEmailAsync(loginUserData:LoginUserData):Promise<User|null>{
        var url=`${config.baseHttpUrl}/get-user-by-email?email=${loginUserData.email}&password=${loginUserData.password}`;
        var result=await getDataAsync(url);
        console.log(result);
        return result;
    
    }
    const handleRegister=()=>{
        setLoginFailMessage('');
        props.onRegister();
    }
    const handleLogin=async()=>{
        if(props.userdata){
            props.onLoginSuccess(props.userdata);
            console.log("credentials already provided");
            return;
        }
        
        var userResult=await getUserByEmailAsync({email:email,password:password});
        if(!userResult){
            setLoginFailMessage("Invalid user , please register first");
        }
        props.onLoginSuccess(userResult!);
      
    };

    return(
    <div id="loginModal">
    <div id="loginPanel">
        <div style={{ alignSelf: 'center' }}>Login</div>
        <div className="formRow">
            <input  id="emailLoginBox" type="text" value={email} onChange={(e)=>setEmail(e.target.value)}/>
            <label id="emailLoginLabel" className="subscribeLabel">Username</label>
        </div>
        <div className="formRow">
            <input id="passwordLoginBox" type="text" value={password} onChange={(e)=>setPassword(e.target.value)}/>
            <label id="passwordLoginLabel" className="subscribeLabel">Password</label>
        </div>
        <div className="formRow">
            <button id="loginBtn" onClick={handleLogin}>Login</button>
            <button id="registerBtn" onClick={handleRegister}>Register</button>
        </div>
        <div  className="formRow">
            <p id="loginFailMessage">{loginFailMessage}</p>
        </div>
    </div>
</div>);
}

export default LoginComponent;