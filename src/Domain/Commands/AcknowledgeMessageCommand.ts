import { AcknowledgeMessageParams } from "../../Dtos/AcknowledgeMessageParams";
import { AKNOWLEDGE_MESSAGE_COMMAND } from "../../Events";
import { Command } from "./Command";

export interface AcknowledgeMessageCommand extends Command {
    kind: typeof AKNOWLEDGE_MESSAGE_COMMAND;
    params:AcknowledgeMessageParams
}