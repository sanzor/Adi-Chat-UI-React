import { REFRESH_CHANNELS_COMMAND } from "../../Events";
import { Command } from "./Command";

export interface GetSubscripttionsCommand extends Command {
    kind: typeof REFRESH_CHANNELS_COMMAND;
}