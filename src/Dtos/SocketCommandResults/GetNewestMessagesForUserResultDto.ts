import{ GET_NEWEST_MESSAGES_FOR_USER } from '../../Events';
import {BaseCommandResultDto} from './BaseCommandResultDto';
import { ChatMessageDto } from './ChatMessageDto';
export interface GetNewestMessagesForUser extends BaseCommandResultDto{
    command:typeof GET_NEWEST_MESSAGES_FOR_USER;
    messages:[ChatMessageDto]
};