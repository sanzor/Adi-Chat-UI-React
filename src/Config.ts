const config = {
    baseHttpUrl: process.env.REACT_APP_API_URL || 'http://localhost:8080',
    baseWsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:8080'
  };
  
  export default config;