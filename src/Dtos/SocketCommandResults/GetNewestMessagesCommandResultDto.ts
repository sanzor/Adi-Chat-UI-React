import { GET_NEWEST_MESSAGES_COMMAND } from '../../Events';
import {BaseCommandResultDto} from './BaseCommandResultDto';
import { ChatMessageDto } from './ChatMessageDto';
export interface GetNewestMessagesCommandResultDto extends BaseCommandResultDto{
    command:typeof GET_NEWEST_MESSAGES_COMMAND;
    messages:ChatMessageDto[]
};