import { BaseCommandDto } from "./BaseCommandDto";
import { GET_NEWEST_MESSAGES_FOR_USER} from "../../Events";
export interface GetNewestMessagesForUser extends BaseCommandDto{
        command: typeof GET_NEWEST_MESSAGES_FOR_USER,
        user_id:number,
        count:number,
};