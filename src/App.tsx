import React, { useState, useEffect } from 'react';
import './App.css';
import LoginComponent from './Components/LoginComponent';
import RegisterComponent from './Components/RegisterComponent';
import MainComponent from './Components/MainComponent';
import { EventBusProvider } from './Components/EventBusContext';
import { WebSocketProvider } from './Websocket/WebsocketContext';
import { getItemFromStorage, setItemInStorage } from './Utils';
import { User } from './Domain/User';
import { UserProvider,useUser } from './Providers/UserContext';

enum VIEWSTATE {
  LOGIN = 'login',
  REGISTER = 'register',
  MAIN = 'main',
}

const App: React.FC = () => {
  const {setUser,user}=useUser();
  // const [user, setUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<VIEWSTATE>(VIEWSTATE.LOGIN);

  // Load user from local storage on initial render
  // useEffect(() => {
  //   const storedUser = getItemFromStorage<User>('user');
  //   if (storedUser) {
  //     setUser(storedUser);
  //     setViewState(VIEWSTATE.MAIN);
  //   } else {
  //     setViewState(VIEWSTATE.LOGIN);
  //   }
  // }, []);

  // Handlers for user actions
  const handleLoginSuccessful = (userData: User): void => {
    console.log(`Login successful. Setting user to: ${JSON.stringify(userData)}`);
    setUser(userData);
    setItemInStorage<User>('user', userData);
    setViewState(VIEWSTATE.MAIN);
  };

  const handleRegisterSuccessful = (userData: User): void => {
    console.log(`Registration successful. Setting user to: ${JSON.stringify(userData)}`);
    setUser(userData);
    setViewState(VIEWSTATE.MAIN);
  };

  const handleBackToLogin = () => {
    console.log("Navigating back to login screen.");
    setViewState(VIEWSTATE.LOGIN);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    setUser(null);
    setViewState(VIEWSTATE.LOGIN);
  };

  // WebSocket connection callbacks
  const handleConnectSuccessful = () => {
    console.log("WebSocket connected successfully.");
  };

  const handleConnectFailed = () => {
    console.error("Failed to connect to WebSocket.");
  };

  return (
    <UserProvider>
    <EventBusProvider>
      <WebSocketProvider
        onConnectSuccessful={handleConnectSuccessful}
        onConnectFailed={handleConnectFailed}
        user={user}
      >
        <div className="App">
          {viewState === VIEWSTATE.LOGIN && (
            <LoginComponent
              onRegister={() => setViewState(VIEWSTATE.REGISTER)}
              onLoginSuccess={handleLoginSuccessful}
              userdata={user}
            />
          )}
          {viewState === VIEWSTATE.REGISTER && (
            <RegisterComponent
              onRegisterSuccess={handleRegisterSuccessful}
              onBackToLogin={handleBackToLogin}
            />
          )}
          {viewState === VIEWSTATE.MAIN && (
            <MainComponent
              onLogout={handleLogout}
              userdata={user}
            />
          )}
        </div>
      </WebSocketProvider>
    </EventBusProvider>
    </UserProvider>
  );
};

export default App;
