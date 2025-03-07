import { BaseCommandDto } from "./BaseCommandDto";
import {GET_NEWEST_MESSAGES_COMMAND} from "../../Events";
export interface GetNewestMessagesCommandDto extends BaseCommandDto{
    command:typeof GET_NEWEST_MESSAGES_COMMAND;
    topic_id:number;
    count:number;
}