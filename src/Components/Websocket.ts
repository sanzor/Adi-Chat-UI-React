
import config from "../Config";
import{
    SOCKET_RECEIVE,
    SOCKET_CLOSED,
    } from "../events";
import EventBus from "./EventBus";


let socket: WebSocket | null = null;
 export function disconnect(){
    if(socket){
        console.log("Closing websocket");
        socket.close();
        socket=null;
    }
 }
 export function connect(){
    if (socket && socket.readyState === WebSocket.OPEN) {
        return;
      }
    
      const url = get_url();
      socket = new WebSocket(url);
    
      socket.onopen = () => {
        console.log('WebSocket connection established');
        
      };
    
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        EventBus.publishEvent(SOCKET_RECEIVE, message);
      };
    
      socket.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
        EventBus.publishEvent(SOCKET_CLOSED, {});
      };
    
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
}

export function send(message:string) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket is not connected');
    }
  }
  
function get_url(){
    var user=JSON.parse(localStorage.user);
    var url= `${config.baseWsUrl}/ws/id/${user.id}`;
    console.log("Url:"+url);
    return url;
}


