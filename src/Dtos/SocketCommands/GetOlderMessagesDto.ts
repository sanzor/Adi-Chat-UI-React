import { BaseCommandDto } from "./BaseCommandDto";
import { GET_OLDER_MESSAGES} from "../../events";
export interface GetOlderMessagesDto extends BaseCommandDto{
        command: typeof GET_OLDER_MESSAGES,
        topicId:number,
        startIndex:number,
        count:number,
};