import { SUBSCRIBE_COMMAND } from "../../Events";
import { Command } from "./Command";
export interface SubscribeCommand extends Command{
    kind: typeof SUBSCRIBE_COMMAND;
    topic:string;   
}
