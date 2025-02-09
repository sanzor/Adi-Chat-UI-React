
import { Command } from "../Domain/Commands/Command";
import { DisconnectCommand } from "../Domain/Commands/DisconnectCommand";
import { GetNewestMessagesCommand } from "../Domain/Commands/GetNewestMessagesCommand";
import { GetOlderMessagesCommand } from "../Domain/Commands/GetOlderMessagesCommand";
import { PublishMessageCommand } from "../Domain/Commands/PublishMessageCommand";
import { GetSubscripttionsCommand } from "../Domain/Commands/RefreshChannelsCommand";
import { SubscribeCommand } from "../Domain/Commands/SubscribeCommand";
import { UnsubscribeCommand } from "../Domain/Commands/UnsubscribeCommand";
import { DISCONNECT_COMMAND,
        GET_NEWEST_MESSAGES_COMMAND,
        GET_OLDER_MESSAGES_COMMAND,
        PUBLISH_MESSAGE_COMMAND,
        REFRESH_CHANNELS_COMMAND,
        SUBSCRIBE_COMMAND,
        UNSUBSCRIBE_COMMAND} from "../Events";
import { BaseCommandDto } from "../Dtos/SocketCommands/BaseCommandDto";
import { SubscribeCommandDto } from "../Dtos/SocketCommands/SubscribeCommandDto";
import { UnsubscribeCommandDto } from "../Dtos/SocketCommands/UnsubscribeCommandDto";
import { GetSubscriptionsCommandDto } from "../Dtos/SocketCommands/GetSubscriptionsCommandDto";
import { PublishCommandDto } from "../Dtos/SocketCommands/PublishCommandDto";
import { DisconnectCommandDto } from "../Dtos/SocketCommands/DisconnectCommandDto";
import { GetNewestMessagesCommandDto } from "../Dtos/SocketCommands/GetNewestMessagesDto";
import { GetOlderMessagesDto as GetOlderMessagesCommandDto } from "../Dtos/SocketCommands/GetOlderMessagesDto";

export function createSocketCommand(data:Command):BaseCommandDto|null{
    var command=innerCreateCommand(data);
    return command;
}
function innerCreateCommand(data:Command): BaseCommandDto|null{
    switch(data.kind){
        case SUBSCRIBE_COMMAND:  
            if(isSubscribeCommand(data)) 
                return create_command_subscribe(data as SubscribeCommand);
            break;
        case UNSUBSCRIBE_COMMAND : 
            if(isUnsubscribeCommand(data))
                return create_command_unsubscribe(data as UnsubscribeCommand);
            break;
        case REFRESH_CHANNELS_COMMAND:
            if(isRefreshChannelsCommand(data))
                return create_command_get_subscriptions();
            break;
        case PUBLISH_MESSAGE_COMMAND :
            if(isPublishMessage(data))
                return create_command_publish(data as PublishMessageCommand);
            break;
        case DISCONNECT_COMMAND:
            if(isDisconnectCommand(data))
                return command_disconnect();
            break;
        case  GET_NEWEST_MESSAGES_COMMAND: 
            if(isGetNewestMessagesCommand(data)){
                var cmd=data as GetNewestMessagesCommand;
                return command_get_newest_messages(cmd);
            }
            
            break;
        case  GET_OLDER_MESSAGES_COMMAND: 
            if(isGetOlderMessagesCommand(data)){
                var command=data as GetOlderMessagesCommand;
                return command_get_older_messages(command);
            }
           
        break;
        default:return null;
    }
    return null;
}
function create_command_subscribe(command:SubscribeCommand):SubscribeCommandDto{
    var message:SubscribeCommandDto={
        command:SUBSCRIBE_COMMAND,
        topic:command.topic
    };
    return message;
}
 function create_command_unsubscribe(command:UnsubscribeCommand):UnsubscribeCommandDto{
   
    var message:UnsubscribeCommandDto={
        command:UNSUBSCRIBE_COMMAND,
        topicId:command.topicId
    }
    return message;
}

function create_command_get_subscriptions():GetSubscriptionsCommandDto{
   
    var message:GetSubscriptionsCommandDto={
        command:REFRESH_CHANNELS_COMMAND
    }
    return message;
    
}
function command_disconnect():DisconnectCommandDto{
    var  message:DisconnectCommandDto={
        command:DISCONNECT_COMMAND
    }
    return message;
}

function create_command_publish(command:PublishMessageCommand):PublishCommandDto{
   
    var toSend:PublishCommandDto={
        command:PUBLISH_MESSAGE_COMMAND,
        topicId:command.topicId,
        content:command.message
    };
    return toSend;
}

function command_get_newest_messages(command:GetNewestMessagesCommand):GetNewestMessagesCommandDto{
    
    var message:GetNewestMessagesCommandDto={
        command:GET_NEWEST_MESSAGES_COMMAND,
        topicId:command.topicId,
        count:command.count,
    }
    return message;
}
function command_get_older_messages(command:GetOlderMessagesCommand):GetOlderMessagesCommandDto{
    var message:GetOlderMessagesCommandDto={
        command:GET_OLDER_MESSAGES_COMMAND,
        topicId:command.topicId,
        startIndex:command.startIndex,
        count:command.count
    }
    return message;
}


function isSubscribeCommand(command: Command): command is SubscribeCommand {
    return command.kind === SUBSCRIBE_COMMAND;
}

function isUnsubscribeCommand(command: Command): command is UnsubscribeCommand {
    return command.kind === UNSUBSCRIBE_COMMAND;
}

function isRefreshChannelsCommand(command: Command): command is GetSubscripttionsCommand {
    return command.kind === REFRESH_CHANNELS_COMMAND;
}

function isPublishMessage(command: Command): command is PublishMessageCommand {
    return command.kind === PUBLISH_MESSAGE_COMMAND;
}

function isDisconnectCommand(command: Command): command is DisconnectCommand {
    return command.kind === DISCONNECT_COMMAND;
}

function isGetNewestMessagesCommand(command: Command): command is GetNewestMessagesCommand {
    return command.kind === GET_NEWEST_MESSAGES_COMMAND;
}

function isGetOlderMessagesCommand(command: Command): command is GetOlderMessagesCommand {
    return command.kind === GET_OLDER_MESSAGES_COMMAND;
}

