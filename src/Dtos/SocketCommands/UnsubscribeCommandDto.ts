import { BaseCommandDto } from "./BaseCommandDto";
import{UNSUBSCRIBE_COMMAND} from "../../events";
export interface UnsubscribeCommandDto extends BaseCommandDto{
    command: typeof UNSUBSCRIBE_COMMAND;
    topicId:number;
}