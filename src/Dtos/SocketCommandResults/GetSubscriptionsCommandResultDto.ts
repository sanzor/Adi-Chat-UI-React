import { REFRESH_CHANNELS_COMMAND } from "../../Events";
import { BaseCommandResultDto } from "./BaseCommandResultDto";

export interface GetSubscriptionsCommandResultDto extends BaseCommandResultDto{
    command: typeof REFRESH_CHANNELS_COMMAND;
};