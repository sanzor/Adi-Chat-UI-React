import { VIEW_MESSAGE_COMMAND } from "../../Events";
import { BaseCommandDto } from "./BaseCommandDto";

export interface MessageViewedCommandDto extends BaseCommandDto{
    command:typeof VIEW_MESSAGE_COMMAND;
    user_id:number;
    topic_id:number;
    message_id:number;
}