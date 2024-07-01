
import config from "../Config";
import{
    SOCKET_RECEIVE,
    SOCKET_CLOSED,
    } from "../Events";
import EventBus from "./EventBus";
import { receiveSocketResult, socketClosed } from "./WebsocketService";


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
        receiveSocketResult(event);
      };
    
      socket.onclose = (event) => {
        socketClosed();
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


