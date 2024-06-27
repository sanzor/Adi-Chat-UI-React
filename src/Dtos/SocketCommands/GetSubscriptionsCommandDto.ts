import { BaseCommandDto } from "./BaseCommandDto";
import {REFRESH_CHANNELS_COMMAND} from "../../events"
export interface GetSubscriptionsCommandDto extends BaseCommandDto{
    command:typeof REFRESH_CHANNELS_COMMAND;
}