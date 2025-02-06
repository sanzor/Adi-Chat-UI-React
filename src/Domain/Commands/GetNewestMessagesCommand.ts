import { GET_NEWEST_MESSAGES_COMMAND } from "../../Events";
import { Command } from "./Command";

export interface GetNewestMessagesCommand extends Command {
    kind: typeof GET_NEWEST_MESSAGES_COMMAND;
    topicId: number;
    count: number;
}