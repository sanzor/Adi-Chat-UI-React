
export interface ChatMessageDto{
    id:number|null;
    temp_id:string;
    user_id:number;
    topic_id:number;
    message:string;
    created_at:string|null;
    status:string
};