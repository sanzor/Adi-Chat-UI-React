import { BaseCommandDto } from "./BaseCommandDto";
import {SUBSCRIBE_COMMAND} from "../../Events";
export interface SubscribeCommandDto extends BaseCommandDto{
    topic:string;
    command:typeof SUBSCRIBE_COMMAND
};