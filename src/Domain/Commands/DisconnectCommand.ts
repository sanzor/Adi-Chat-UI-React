import { DISCONNECT_COMMAND } from "../../Events";
import { Command } from "./Command";

export interface DisconnectCommand extends Command {
    kind: typeof DISCONNECT_COMMAND;
}
