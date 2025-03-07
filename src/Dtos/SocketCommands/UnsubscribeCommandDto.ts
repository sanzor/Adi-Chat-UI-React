import { BaseCommandDto } from "./BaseCommandDto";
import{UNSUBSCRIBE_COMMAND} from "../../Events";
export interface UnsubscribeCommandDto extends BaseCommandDto{
    command: typeof UNSUBSCRIBE_COMMAND;
    topic_id:number;
}