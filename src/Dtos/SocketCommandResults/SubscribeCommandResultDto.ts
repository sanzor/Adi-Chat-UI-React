import { Channel } from "../../Domain/Channel";
import { SUBSCRIBE_COMMAND_RESULT } from "../../Events";
import { BaseCommandResultDto } from "./BaseCommandResultDto";

export interface SubscribeCommandResultDto extends BaseCommandResultDto{
    command: typeof SUBSCRIBE_COMMAND_RESULT;
    topic?:Channel;
}