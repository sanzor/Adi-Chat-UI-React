
import { AKNOWLEDGE_MESSAGE_COMMAND } from "../../Events";
import { Command } from "./Command";

export interface AcknowledgeMessageCommand extends Command {
    kind: typeof AKNOWLEDGE_MESSAGE_COMMAND;
    user_id:number;
    temp_id:string;
}