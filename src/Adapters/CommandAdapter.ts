
import { Command } from "../Domain/Commands/Command";
import { DisconnectCommand } from "../Domain/Commands/DisconnectCommand";
import { GetNewestMessagesCommand } from "../Domain/Commands/GetNewestMessagesCommand";
import { GetOlderMessagesCommand } from "../Domain/Commands/GetOlderMessagesCommand";
import { PublishMessageCommand } from "../Domain/Commands/PublishMessageCommand";
import { GetSubscripttionsCommand } from "../Domain/Commands/RefreshChannelsCommand";
import { SubscribeCommand } from "../Domain/Commands/SubscribeCommand";
import { UnsubscribeCommand } from "../Domain/Commands/UnsubscribeCommand";
import { AKNOWLEDGE_MESSAGE_COMMAND, DISCONNECT_COMMAND,
        GET_NEWEST_MESSAGES_COMMAND,
        GET_NEWEST_MESSAGES_FOR_USER_COMMAND,
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
import { GetNewestMessagesCommandDto } from "../Dtos/SocketCommands/GetNewestMessagesCommandDto";
import { GetOlderMessagesDto as GetOlderMessagesCommandDto } from "../Dtos/SocketCommands/GetOlderMessagesDto";
import { GetNewestMessagesForUserCommand } from "../Domain/Commands/GetNewestMessagesForUserCommand";
import { GetNewestMessagesForUserCommandDto } from "../Dtos/SocketCommands/GetNewestMessagesForUserCommandDto";
import { AcknowledgeMessageCommandDto } from "../Dtos/SocketCommands/AcknowledgeMessageCommandDto";
import { AcknowledgeMessageCommand } from "../Domain/Commands/AcknowledgeMessageCommand";


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
                return command_publish_message(data as PublishMessageCommand);
            break;
        case AKNOWLEDGE_MESSAGE_COMMAND:
            if(isAcknowledgeMessageCommand(data)){
                console.log(data);
                return command_acknowledge_message(data as AcknowledgeMessageCommand);
            }   
            break;
        case DISCONNECT_COMMAND:
            if(isDisconnectCommand(data))
                return create_command_disconnect();
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
        case GET_NEWEST_MESSAGES_FOR_USER_COMMAND:
            if(isGetNewestMessagesForUserCommand(data)){
                var newestMessagesForUserCommand=data as GetNewestMessagesForUserCommand;
                return command_get_newest_messages_for_user(newestMessagesForUserCommand);
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
        topic_id:command.topic_id
    }
    return message;
}

function create_command_get_subscriptions():GetSubscriptionsCommandDto{
   
    var message:GetSubscriptionsCommandDto={
        command:REFRESH_CHANNELS_COMMAND
    }
    return message;
    
}
function create_command_disconnect():DisconnectCommandDto{
    var  message:DisconnectCommandDto={
        command:DISCONNECT_COMMAND
    }
    return message;
}

function command_publish_message(command:PublishMessageCommand):PublishCommandDto{
   
    var toSend:PublishCommandDto={
        command:PUBLISH_MESSAGE_COMMAND,
        temp_id:command.message.tempId,
        topic_id:command.message.topicId,
        content:command.message.message,
        user_id:command.message.userId,

    };
    return toSend;
}

function command_acknowledge_message(command:AcknowledgeMessageCommand):AcknowledgeMessageCommandDto{
   
    var toSend:AcknowledgeMessageCommandDto={
        command:AKNOWLEDGE_MESSAGE_COMMAND,
        user_id:command.user_id,
        message_temp_id:command.temp_id
    };
    console.log("Creating ack command");
    console.log(JSON.stringify(toSend));
    return toSend;
}

function command_get_newest_messages(command:GetNewestMessagesCommand):GetNewestMessagesCommandDto{
    
    var message:GetNewestMessagesCommandDto={
        command:GET_NEWEST_MESSAGES_COMMAND,
        topic_id:command.topic_id,
        count:command.count,
    }
    return message;
}

function command_get_newest_messages_for_user(command:GetNewestMessagesForUserCommand):GetNewestMessagesForUserCommandDto{
    var message:GetNewestMessagesForUserCommandDto={
        command:GET_NEWEST_MESSAGES_FOR_USER_COMMAND,
        user_id:command.user_id,
        count:command.count,
    }
    return message;
}
function command_get_older_messages(command:GetOlderMessagesCommand):GetOlderMessagesCommandDto{
    var message:GetOlderMessagesCommandDto={
        command:GET_OLDER_MESSAGES_COMMAND,
        topicId:command.topic_id,
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
function isAcknowledgeMessageCommand(command: Command): command is AcknowledgeMessageCommand {
    return command.kind === AKNOWLEDGE_MESSAGE_COMMAND;
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

function isGetNewestMessagesForUserCommand(command: Command): command is GetNewestMessagesForUserCommand {
    return command.kind === GET_NEWEST_MESSAGES_FOR_USER_COMMAND;
}

