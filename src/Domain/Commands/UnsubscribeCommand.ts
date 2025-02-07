import { UNSUBSCRIBE_COMMAND } from "../../Events";
import { Command } from "./Command";

export interface UnsubscribeCommand extends Command {
    kind: typeof UNSUBSCRIBE_COMMAND;
    topicId: number;
}