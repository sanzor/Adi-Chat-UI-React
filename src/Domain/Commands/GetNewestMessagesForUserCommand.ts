import { GET_NEWEST_MESSAGES_FOR_USER_COMMAND } from "../../Events";
import { Command } from "./Command";

export interface GetNewestMessagesForUserCommand extends Command{
    kind: typeof GET_NEWEST_MESSAGES_FOR_USER_COMMAND,
    user_id:number,
    count:number,
};