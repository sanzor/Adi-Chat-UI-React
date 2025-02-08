import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "../Domain/User";
import { getItemFromStorage, setItemInStorage } from "../Utils";
import { USER } from "../Constants";

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
  };

  const UserContext=createContext<UserContextType|undefined>(undefined);

  export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    useEffect(()=>{
       const storedUser=getItemFromStorage<User>(USER);
       if(storedUser){
        setUser(storedUser);
       }
    },[]);

    const updateUser=(newUser:User|null)=>{
        setUser(newUser);
        if(newUser){
          setItemInStorage(USER,newUser);
        }else{
          localStorage.removeItem(USER);
        }
    }
    return (
      <UserContext.Provider value={{user,setUser:updateUser}}></UserContext.Provider>
    )
  };

export const useUser=()=>{
   const context=useContext(UserContext);
   if(!context){
    throw new Error("useUser must be used within a UserProvider")
   }
   return context;
}