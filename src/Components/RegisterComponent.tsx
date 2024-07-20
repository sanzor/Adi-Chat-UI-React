import React,{useState,FC}from 'react';
import { User } from '../Domain/User';
import { CreateUserParams } from '../Dtos/CreateUserParams';
import { CreateUserResult } from '../Dtos/CreateUserResult';
import config from '../Config';
import { postDataAsync } from '../Utils';

interface RegisterComponentProps{
    onRegisterSuccess(User:User):void;
    onBackToLogin():void;
};
const RegisterComponent:FC<RegisterComponentProps>=(props)=>{
    const [username,setUsername]=useState('adrian');
    const [password,setPassword]=useState('aa');
    const [email,setEmail]=useState('adriansan_93@yahoo.com');
    const [retypePassword,setRetypePasswoord]=useState('aa');
    const [registerFailMessage,setRegisterFailMessage]=useState('');

    async function onSubmit():Promise<void>{
        console.log("onSubmit");
        var validateResult=validateCreateUserData({name:username,password:password,email:email,retypePassword:retypePassword});
        if(validateResult instanceof Error){
             const err:Error=validateResult
             setRegisterFailMessage(`Invalid data having reason:${err.message}`);
             return;
        }
        const succesfulData:CreateUserParams=validateResult;
        try{
        
         var userResult:CreateUserResult=await createUserAsync(succesfulData);
         console.log("USER CREATED !!!");
         if(userResult.result=="error"){
           setRegisterFailMessage(userResult.result);
           return;
         }
         console.log(`User created:${userResult}`);
         var user=userResult.result as User;
         console.log(user);
         props.onRegisterSuccess(user);
         
        }catch(error:any){
            setRegisterFailMessage(error.message);
        }
    };
    async function createUserAsync(userData:CreateUserParams):Promise<CreateUserResult>{
        var url:string=`/create-user`;
        var result=await postDataAsync(url,userData);
        console.log("in create\n");
        console.log(result);
        return result as CreateUserResult;
    }
    function validateCreateUserData(data:CreateUserParams):CreateUserParams|Error{
        if(data.name==undefined || data.name==null){
            return new Error("Invalid username");
        }
        if(data.password==undefined || data.password==null){
            return new Error("Invalid password");
        }
        if(data.password!=data.retypePassword){
            
            return new Error("Passwords do not match");
        }
        return data;
    
    }
    return( 
    <div id="registerModal">
    <div id="registerPanel">
        <div className="formRow">
            <input  id="emailBox" type="text" value={email} onChange={(e)=>setEmail(e.target.value)}/>
            <label id="emailLabel" className="subscribeLabel">Email</label>
        </div>
        <div className="formRow">
            <input  id="usernameBox" type="text" value={username} onChange={(e)=>setUsername(e.target.value)}/>
            <label id="usernameLabel" className="subscribeLabel">Username</label>
        </div>
        <div className="formRow">
            <input id="passwordBox" type="text" value={password} onChange={(e)=>setPassword(e.target.value)}/>
            <label id="passwordLabel" className="subscribeLabel">Password</label>
        </div>
        <div className="formRow">
            <input id="retypePasswordBox" type="text" value={retypePassword} onChange={(e)=>setRetypePasswoord(e.target.value)}/>
            <label id="retypePasswordLabel" className="subscribeLabel">Retype Password</label>
        </div>
        <div className="formRow">
            <button id="backToLoginBtn">Back to Login</button>
            <button id="submitBtn" onClick={onSubmit}>Submit</button>
        </div>
        <div className="formRow">
            <p id="registerFailMessage">{registerFailMessage}</p>
        </div>
    </div>
    </div>);
};
export default RegisterComponent;