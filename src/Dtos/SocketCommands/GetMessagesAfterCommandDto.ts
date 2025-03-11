import { BaseCommandDto } from "./BaseCommandDto";
import {GET_MESSAGES_AFTER_COMMAND} from "../../Events";
export interface GetMessagesAfterCommandDto extends BaseCommandDto{
    command:typeof GET_MESSAGES_AFTER_COMMAND;
    topic_id:number;
    count:number;
}