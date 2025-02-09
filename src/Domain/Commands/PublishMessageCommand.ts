import { PublishMessageParams } from "../../Dtos/PublishMessageParams";
import { PUBLISH_MESSAGE_COMMAND } from "../../Events";
import { Command } from "./Command";

export interface PublishMessageCommand extends Command {
    kind: typeof PUBLISH_MESSAGE_COMMAND;
    message:PublishMessageParams
}