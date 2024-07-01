import { BaseCommandDto } from "./BaseCommandDto";
import {DISCONNECT_COMMAND} from "../../Events";
export interface DisconnectCommandDto extends BaseCommandDto{
    command:typeof DISCONNECT_COMMAND;
}