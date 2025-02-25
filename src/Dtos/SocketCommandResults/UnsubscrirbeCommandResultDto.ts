import { UNSUBSCRIBE_COMMAND } from "../../Events";
import { BaseCommandResultDto } from "./BaseCommandResultDto";
import { SubscriptionDto } from "./SubscriptionDto";

export interface UnsubscribeCommandResultDto extends BaseCommandResultDto{
    command: typeof UNSUBSCRIBE_COMMAND;
    topicId:number;
    result:string;
    subscriptions:SubscriptionDto[]
}