import { BaseCommandDto } from "./BaseCommandDto";
import {PUBLISH_MESSAGE} from "../../events";
export interface PublishCommandDto extends BaseCommandDto{
    command:typeof PUBLISH_MESSAGE;
    topicId:number;
    content:string;
}