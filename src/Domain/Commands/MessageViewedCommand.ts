
import { VIEW_MESSAGE_COMMAND as MESSAGE_VIEWED_COMMAND } from "../../Events";
import { Command } from "./Command";

export interface MessageViewedCommand extends Command {
    kind: typeof MESSAGE_VIEWED_COMMAND;
    topic_id:number;
    user_id:number;
    message_id:number;
}