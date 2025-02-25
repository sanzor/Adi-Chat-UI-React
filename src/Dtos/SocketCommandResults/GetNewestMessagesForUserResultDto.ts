
import { GET_NEWEST_MESSAGES_FOR_USER_COMMAND } from '../../Events';
import { ChannelWithMessagesDto } from '../ChannelWithMessagesDto';
import {BaseCommandResultDto} from './BaseCommandResultDto';
export interface GetNewestMessagesForUserCommandResultDto extends BaseCommandResultDto{
    command:typeof GET_NEWEST_MESSAGES_FOR_USER_COMMAND;
    channels_with_messages:ChannelWithMessagesDto[]
};