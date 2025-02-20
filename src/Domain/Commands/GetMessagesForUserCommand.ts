import { GET_NEWEST_MESSAGES_FOR_USER } from "../../Events";
import { Command } from "./Command";

export interface GetNewestMessagesForUser extends Command {
    kind: typeof GET_NEWEST_MESSAGES_FOR_USER;
    user_id:number;
    count:number;
}