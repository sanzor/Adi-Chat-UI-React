import { GET_OLDER_MESSAGES_COMMAND } from "../../Events";
import { Command } from "./Command";

export interface GetOlderMessagesCommand extends Command {
    kind: typeof GET_OLDER_MESSAGES_COMMAND;
    topic_id: number;
    startIndex: number;
    count: number;
}