import { GET_OLDER_MESSAGES_COMMAND } from "../../Events";
import { BaseCommandResultDto } from "./BaseCommandResultDto";

export interface GetOlderMessagesCommandResultDto extends BaseCommandResultDto{
    command: typeof GET_OLDER_MESSAGES_COMMAND;
};