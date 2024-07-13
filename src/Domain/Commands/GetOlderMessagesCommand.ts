import { GET_OLDER_MESSAGES_COMMAND } from "../../Events";
import { Command } from "./Command";

export interface GetOlderMessagesCommand extends Command {
    kind: typeof GET_OLDER_MESSAGES_COMMAND;
    topicId: number;
    startIndex: number;
    count: number;
}