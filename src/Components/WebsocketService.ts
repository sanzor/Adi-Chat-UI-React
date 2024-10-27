import { createSocketCommand } from "../Adapters/CommandAdapter";
import { SOCKET_COMMAND } from "../Constants";
import { Command } from "../Domain/Commands/Command";
import { SOCKET_CLOSED, SOCKET_RECEIVE } from "../Events";
import EventBus from "./EventBus";
import { send } from "./Websocket";


EventBus.subscribe(SOCKET_COMMAND,onSocketCommand);
EventBus.subscribe(SOCKET_RECEIVE,onSocketReceive);
EventBus.subscribe(SOCKET_CLOSED,onSocketClosed);

// --------api ------
export function sendSocketCommand(command:Command){
    EventBus.publishEvent(SOCKET_COMMAND,command);
}
export function receiveSocketResult(result:MessageEvent):void{
    EventBus.publishEvent(SOCKET_RECEIVE,result);
}
export function socketClosed(){
    EventBus.publishEvent(SOCKET_CLOSED,{});
}



// ----- callbacks -------

function onSocketCommand(event:CustomEvent):void{
    var command:Command=event.detail;
    var socketCommand=createSocketCommand(command);
    console.log("socket command");
    console.log(socketCommand);
    var payload=JSON.stringify(socketCommand);
    send(payload);
}

function onSocketReceive(event:CustomEvent):void{
    var data=JSON.parse(event.detail);
}

function onSocketClosed(event:CustomEvent):void{

}


