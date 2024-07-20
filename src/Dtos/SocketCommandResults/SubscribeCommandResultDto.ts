import { Channel } from "../../Domain/Channel";
import { SUBSCRIBE_COMMAND_RESULT } from "../../Events";
import { BaseCommandResultDto } from "./BaseCommandResultDto";
import { SubscriptionDto } from "./SubscriptionDto";

export interface SubscribeCommandResultDto extends BaseCommandResultDto{
    command: typeof SUBSCRIBE_COMMAND_RESULT;
    topic?:SubscriptionDto;
    result:string;
}