import { GET_MESSAGES_AFTER_COMMAND } from "../../Events";
import { Command } from "./Command";

export interface GetMessagesAfterCommand extends Command {
    kind: typeof GET_MESSAGES_AFTER_COMMAND;
    topic_id: number;
    from_message_id:number;
    count: number;
}