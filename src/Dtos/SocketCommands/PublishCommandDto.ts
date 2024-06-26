import { BaseCommandDto } from "./BaseCommandDto";
import {PUBLISH_MESSAGE_COMMAND} from "../../Events";
export interface PublishCommandDto extends BaseCommandDto{
    command:typeof PUBLISH_MESSAGE_COMMAND;
    topicId:number;
    content:string;
}