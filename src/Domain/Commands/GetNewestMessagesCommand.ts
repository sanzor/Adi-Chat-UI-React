import { GET_NEWEST_MESSAGES_COMMAND } from "../../Events";
import { Command } from "./Command";

export interface GetNewestMessagesCommand extends Command {
    kind: typeof GET_NEWEST_MESSAGES_COMMAND;
    topic_id: number;
    count: number;
}