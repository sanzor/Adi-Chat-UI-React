import React, { useEffect, useState } from 'react';
import './App.css';
import LoginComponent from './Components/LoginComponent';
import RegisterComponent from './Components/RegisterComponent';
import MainComponent from './Components/MainComponent';
import { setItemInStorage } from './Utils';
import { User } from './Domain/User';
import { useUser } from './Providers/UserContext';
import { WebSocketProvider } from './Providers/WebsocketContext';
import { ChannelsProvider } from './Providers/ChannelContext';

enum VIEWSTATE {
  LOGIN = 'login',
  REGISTER = 'register',
  MAIN = 'main',
}

const App: React.FC = () => {
 // ✅ Reacts to user state change
  const {setUser,user}=useUser();
  useEffect(() => {
    console.log("App rendering, current user:", user);
    if (user) {
      setViewState(VIEWSTATE.MAIN);
    }
  }, [user]);
  // const [user, setUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<VIEWSTATE>(VIEWSTATE.LOGIN);
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
            <ChannelsProvider>
                <MainComponent
                  onLogout={handleLogout}
                />
            </ChannelsProvider>
            
          )}
        </div>
      </WebSocketProvider>
  );
};

export default App;
