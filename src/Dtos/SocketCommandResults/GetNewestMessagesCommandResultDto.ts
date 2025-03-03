import { ChatMessage } from '../../Domain/ChatMessage';
import { GET_NEWEST_MESSAGES_COMMAND } from '../../Events';
import {BaseCommandResultDto} from './BaseCommandResultDto';
export interface GetNewestMessagesCommandResultDto extends BaseCommandResultDto{
    command:typeof GET_NEWEST_MESSAGES_COMMAND;
    messages:ChatMessage[]
};