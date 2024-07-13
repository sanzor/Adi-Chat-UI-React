import { UNSUBSCRIBE_COMMAND } from "../../Events";
import { Message } from "../Message";

export interface UnsubscribeCommand extends Message {
    kind: typeof UNSUBSCRIBE_COMMAND;
    topicId: number;
}