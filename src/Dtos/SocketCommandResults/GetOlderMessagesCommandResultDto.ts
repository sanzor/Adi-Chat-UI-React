import { GET_OLDER_MESSAGES_COMMAND } from "../../Events";
import { BaseCommandResultDto } from "./BaseCommandResultDto";
import { ChatMessageDto } from "./ChatMessageDto";

export interface GetOlderMessagesCommandResultDto extends BaseCommandResultDto{
    command: typeof GET_OLDER_MESSAGES_COMMAND;
    result:[ChatMessageDto]
};