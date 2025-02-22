import { GET_NEWEST_MESSAGES_FOR_USER_COMMAND } from "../../Events";
import { BaseCommandDto } from "./BaseCommandDto";
export interface GetNewestMessagesForUserCommandDto extends BaseCommandDto{
        command: typeof GET_NEWEST_MESSAGES_FOR_USER_COMMAND,
        user_id:number,
        count:number,
};