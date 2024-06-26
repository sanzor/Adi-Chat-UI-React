import { BaseCommandDto } from "./BaseCommandDto";
import { GET_OLDER_MESSAGES_COMMAND} from "../../Events";
export interface GetOlderMessagesDto extends BaseCommandDto{
        command: typeof GET_OLDER_MESSAGES_COMMAND,
        topicId:number,
        startIndex:number,
        count:number,
};