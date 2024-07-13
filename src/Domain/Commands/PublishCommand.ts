import { PUBLISH_MESSAGE_COMMAND } from "../../Events";
import { Command } from "./Command";

export interface PublishCommand extends Command {
    kind: typeof PUBLISH_MESSAGE_COMMAND;
    userId: number;
    topicId: number;
    message: string;
}