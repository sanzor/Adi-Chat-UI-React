
import { ChatMessage } from "./Domain/ChatMessage";
import { CommandResult } from "./Dtos/SocketCommandResults/CommandResult";
import { SubscribeCommandResultDto } from "./Dtos/SocketCommandResults/SubscribeCommandResultDto";
import { UnsubscribeCommandResultDto } from "./Dtos/SocketCommandResults/UnsubscrirbeCommandResultDto";
import { GetNewestMessagesCommandResultDto } from "./Dtos/SocketCommandResults/GetNewestMessagesCommandResultDto";
import { GetOlderMessagesCommandResultDto } from "./Dtos/SocketCommandResults/GetOlderMessagesCommandResultDto";
import { ReceivedMessage } from "./Dtos/ReceivedMessage";
import { 
        REFRESH_CHANNELS_COMMAND, 
        REFRESH_CHANNELS_COMMAND_RESULT,
        RESET_CHAT, SOCKET_RECEIVE, SUBSCRIBE_COMMAND,
        SUBSCRIBE_COMMAND_RESULT, 
        SUBSCRIBE_COMMAND_RESULT_U, 
        UNSUBSCRIBE_COMMAND,
        UNSUBSCRIBE_COMMAND_RESULT, 
        UNSUBSCRIBE_COMMAND_RESULT_U,
        NEW_INCOMING_MESSAGE,
        GET_NEWEST_MESSAGES_COMMAND,
        GET_OLDER_MESSAGES_COMMAND,} from "./Events";
import EventBus from "./EventBus";
import {CHAT,USER_EVENT,COMMAND_RESULT} from "./Constants";


EventBus.subscribe(SOCKET_RECEIVE,onSocketReceive);

function onSocketReceive(ev:any){
   
    var data=ev.detail as ReceivedMessage;
    if(data.kind==CHAT){
        handle_chat_message(data as ChatMessage);
        return;
    }
    if(data.kind==COMMAND_RESULT){
        handle_command_result(data as CommandResult);
        return;
    }
    if(data.kind=USER_EVENT){
        
        console.log("Received user event");
        console.log(data as any);
        
    }

    
}

function onNewChatMessage(data:any){
   
}
function handle_chat_message(data:any){
    console.log("New Message !!!");
    console.log(data.detail);
    EventBus.publish(NEW_INCOMING_MESSAGE,data.detail);
    
    
}
function handle_command_result(data:CommandResult){
    if(data.command==SUBSCRIBE_COMMAND){
        callback_subscribe(data);
    }
    if(data.command==UNSUBSCRIBE_COMMAND){
        callback_unsubscribe(data.result as UnsubscribeCommandResultDto);
    }
    if(data.command==REFRESH_CHANNELS_COMMAND){
        
        console.log(data);
        EventBus.publish(REFRESH_CHANNELS_COMMAND_RESULT,data.result);
    }
    if(data.command==GET_NEWEST_MESSAGES_COMMAND){
        callback_get_newest_messages(data.result as GetNewestMessagesCommandResultDto);
    }
    if(data.command==GET_OLDER_MESSAGES_COMMAND){
        callback_get_older_messages(data);
    }
}
function handle_user_event(data:any){
    if(data.user_event_kind==SUBSCRIBE_COMMAND){
        handle_user_event_subscribe(data);
    }
    if(data.user_event_kind==UNSUBSCRIBE_COMMAND){
        handle_user_event_unsubscribe(data);
    }
}

function handle_user_event_subscribe(data:any){
    console.log("Publishing update channels");
    EventBus.publish(SUBSCRIBE_COMMAND_RESULT_U,data);
   
}
function handle_user_event_unsubscribe(data:any){
    console.log("Publishing update channels");
    EventBus.publish(UNSUBSCRIBE_COMMAND_RESULT_U,data);
}
function callback_subscribe(data:SubscribeCommandResultDto){
    console.log(data);
    EventBus.publish(SUBSCRIBE_COMMAND_RESULT,data);
   
}
function callback_unsubscribe(data:UnsubscribeCommandResultDto){
    console.log(data);
    if(data.result=="ok"){
        EventBus.publish(UNSUBSCRIBE_COMMAND_RESULT,data);
        EventBus.publish(RESET_CHAT,{});
    }
}
function callback_get_newest_messages(data:GetNewestMessagesCommandResultDto){
    console.log(data.messages);
    EventBus.publish("getNewestMessages",data.messages)
   
}
function callback_get_older_messages(data:GetOlderMessagesCommandResultDto){
    EventBus.publish("getOlderMessages",data.result);
}


