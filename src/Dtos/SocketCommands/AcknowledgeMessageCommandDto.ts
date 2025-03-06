import { AKNOWLEDGE_MESSAGE_COMMAND } from "../../Events";
import { BaseCommandDto } from "./BaseCommandDto";

export interface AcknowledgeMessageCommandDto extends BaseCommandDto{
    command:typeof AKNOWLEDGE_MESSAGE_COMMAND;
    user_id:number;
    message_temp_id:string;
}