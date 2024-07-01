import { UNSUBSCRIBE_COMMAND } from "../../Events";
import { BaseCommandResultDto } from "./BaseCommandResultDto";

export interface UnsubscribeCommandResultDto extends BaseCommandResultDto{
    command: typeof UNSUBSCRIBE_COMMAND;
    topicId:string;
}