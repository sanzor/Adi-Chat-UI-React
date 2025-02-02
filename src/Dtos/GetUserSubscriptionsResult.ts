import { Channel } from "../Domain/Channel";

export interface GetUserSubscriptionsResult{
    user_id:number;
    subscriptions:Channel[];
}