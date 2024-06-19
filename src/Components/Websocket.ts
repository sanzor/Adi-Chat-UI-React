import { publishEvent, subscribeToEvent } from "../bus";
import config from "../Config";
import { SOCKET_COMMAND } from "../constants";
import { Command} from '../Domain/Commands/Command';
import { PublishCommand} from '../Domain/Commands/PublishCommand';
import { SubscribeCommand} from '../Domain/Commands/SubscribeCommand';
import { UnsubscribeCommand} from '../Domain/Commands/UnsubscribeCommand';
import { RefreshChannelsCommand} from '../Domain/Commands/RefreshChannelsCommand';
import { DisconnectCommand} from '../Domain/Commands/DisconnectCommand';
import { GetNewestMessagesCommand} from '../Domain/Commands/GetNewestMessagesCommand';
import { GetOlderMessagesCommand} from '../Domain/Commands/GetOlderMessagesCommand';
import{
    SUBSCRIBE_COMMAND,
    UNSUBSCRIBE_COMMAND,
    REFRESH_CHANNELS_COMMAND,
    PUBLISH_MESSAGE,
    GET_NEWEST_MESSAGES,
    GET_OLDER_MESSAGES,
    SOCKET_RECEIVE,
    SOCKET_CLOSED,
    } from "../events";
import EventBus from "./EventBus";
export{connect};

var socket:WebSocket=null!;

 function connect(){
    if (socket && socket.readyState === WebSocket.OPEN) {
        return;
      }
    
      const url = get_url();
      socket = new WebSocket(url);
    
      socket.onopen = () => {
        console.log('WebSocket connection established');
        command_get_subscriptions();
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
function get_url(){
    var user=JSON.parse(localStorage.user);
    var url= `${config.baseWsUrl}/ws/id/${user.id}`;
    console.log("Url:"+url);
    return url;
}

//interface----------------------
export function sendEvent(command: Command) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(command));
    }else{
        throw new Error("Socket is not connected");
    }
  }

  // Subscribe to custom events to handle commands
    EventBus.subscribe('SEND_COMMAND', (command: Command) => {
    sendEvent(command);
  });
function onAsyncCommand(ev:CustomEvent){
    var data=ev.detail;
    onCommand(data);
}
function onCommand(data:Command){
    console.log(data);
    console.log(`\nSending [${data.kind}] command : ${data} to socket\n`);
    switch(data.kind){
        case SUBSCRIBE_COMMAND:  
            if(isSubscribeCommand(data)) 
                command_subscribe((data as SubscribeCommand).topic);
            break;
        case UNSUBSCRIBE_COMMAND : 
            if(isUnsubscribeCommand(data))
                command_unsubscribe((data as UnsubscribeCommand).topicId);
            break;
        case REFRESH_CHANNELS_COMMAND:
            if(isRefreshChannelsCommand(data))
                command_get_subscriptions();
            break;
        case PUBLISH_MESSAGE :
            if(isPublishMessage(data))
                command_publish(data as PublishCommand);
            break;
        case "disconnect":
            if(isDisconnectCommand(data))
            command_disconnect();
            break;
        case  GET_NEWEST_MESSAGES: 
            if(isGetNewestMessagesCommand(data)){
                var cmd=data as GetNewestMessagesCommand;
                command_get_newest_messages(cmd);
            }
            
            break;
        case  GET_OLDER_MESSAGES: 
            if(isGetOlderMessagesCommand(data)){
                var command=data as GetOlderMessagesCommand;
                command_get_older_messages(command);
            }
           
        break;
    }
}
function command_subscribe(topic:string){
    console.log("inside command sub");
    console.log(topic);
    var message={
        "command":SUBSCRIBE_COMMAND,
        "topic":topic
    };
    console.log("\nSending:" + JSON.stringify(message));
    console.log(socket);
    socket.send(JSON.stringify(message))
}
 function command_unsubscribe(topicId:number){
    console.log(topicId);
    var message={
        "command":UNSUBSCRIBE_COMMAND,
        "topicId":topicId
    }
     console.log("\nSending:" + JSON.stringify(message));
     socket.send(JSON.stringify(message));
}

function command_get_subscriptions(){
   
    var message={
        "command":REFRESH_CHANNELS_COMMAND
    }
    console.log("\nSending:" + JSON.stringify(message));
    socket.send(JSON.stringify(message));
    
}
function command_disconnect(){
    publishEvent("close_socket",{});
}

function command_publish(command:PublishCommand){
    console.log(command.topicId);
    var toSend={
        "command":PUBLISH_MESSAGE,
        "topicId":command.topicId,
        "content":command.message
    };
    console.log("\nSending:" + JSON.stringify(toSend));
    socket.send(JSON.stringify(toSend));
}

function command_get_newest_messages(command:GetNewestMessagesCommand){
    
    var message={
        "command":GET_NEWEST_MESSAGES,
        "topicId":command.topicId,
        "count":command.count,
        
    }
    console.log(message);
    socket.send(JSON.stringify(message));
}
function command_get_older_messages(command:GetOlderMessagesCommand){
    var message={
        "command":GET_OLDER_MESSAGES,
        "topicId":command.topicId,
        "startIndex":command.startIndex,
        "count":command.count,
        
    }
    console.log(message);
    socket.send(JSON.stringify(message));
}


function isSubscribeCommand(command: Command): command is SubscribeCommand {
    return command.kind === "subscribe";
}

function isUnsubscribeCommand(command: Command): command is UnsubscribeCommand {
    return command.kind === "unsubscribe";
}

function isRefreshChannelsCommand(command: Command): command is RefreshChannelsCommand {
    return command.kind === "refresh_channels";
}

function isPublishMessage(command: Command): command is PublishCommand {
    return command.kind === "publish";
}

function isDisconnectCommand(command: Command): command is DisconnectCommand {
    return command.kind === "disconnect";
}

function isGetNewestMessagesCommand(command: Command): command is GetNewestMessagesCommand {
    return command.kind === "get_newest_messages";
}

function isGetOlderMessagesCommand(command: Command): command is GetOlderMessagesCommand {
    return command.kind === "get_older_messages";
}
