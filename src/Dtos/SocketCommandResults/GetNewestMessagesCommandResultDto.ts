import { GET_NEWEST_MESSAGES_COMMAND } from '../../Events';
import { ChatMessageDto } from '../ChatMessageDto';
import {BaseCommandResultDto} from './BaseCommandResultDto';
export interface GetNewestMessagesCommandResultDto extends BaseCommandResultDto{
    command:typeof GET_NEWEST_MESSAGES_COMMAND;
    messages:ChatMessageDto[]
};