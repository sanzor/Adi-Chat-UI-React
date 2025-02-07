import { PUBLISH_MESSAGE_COMMAND } from "../../Events";
import { ChatMessage } from "../ChatMessage";
import { Command } from "./Command";

export interface PublishMessageCommand extends Command {
    kind: typeof PUBLISH_MESSAGE_COMMAND;
    message:ChatMessage
}