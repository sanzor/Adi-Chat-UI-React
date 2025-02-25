import { REFRESH_CHANNELS_COMMAND } from "../../Events";
import { BaseCommandResultDto } from "./BaseCommandResultDto";
import { SubscriptionDto } from "./SubscriptionDto";

export interface GetSubscriptionsCommandResultDto extends BaseCommandResultDto{
    command: typeof REFRESH_CHANNELS_COMMAND;
    result:SubscriptionDto[]
};