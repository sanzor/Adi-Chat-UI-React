import { REFRESH_CHANNELS_COMMAND } from "../../Events";
import { Message } from "../Message";

export interface GetSubscripttionsCommand extends Message {
    kind: typeof REFRESH_CHANNELS_COMMAND;
}