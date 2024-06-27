import { createSocketCommand } from "../Adapters/CommandAdapter";
import { publishEvent, subscribeToEvent } from "../bus";
import { SOCKET_COMMAND } from "../constants";
import { Command } from "../Domain/Commands/Command";
import { send } from "./Websocket";

export function sendSocketCommand(command:Command){
    publishEvent(SOCKET_COMMAND,command);
}
export function sendSocketMessage(message:any){

}
subscribeToEvent(SOCKET_COMMAND,onSocketCommand);

function onSocketCommand(event:CustomEvent):void{
    var command:Command=event.detail;
    var socketCommand=createSocketCommand(command);
    var payload=JSON.stringify(socketCommand);
    send(payload);
}