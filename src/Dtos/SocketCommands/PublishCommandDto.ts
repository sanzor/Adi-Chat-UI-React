import { BaseCommandDto } from "./BaseCommandDto";
import {PUBLISH_MESSAGE_COMMAND} from "../../Events";
export interface PublishCommandDto extends BaseCommandDto{
    command:typeof PUBLISH_MESSAGE_COMMAND;
    temp_id:string;
    user_id:number;
    topic_id:number;
    content:string;
}