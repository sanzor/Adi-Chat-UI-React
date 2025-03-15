
//socket commands
const REFRESH_CHANNELS_COMMAND:string="get_subscriptions";
const SUBSCRIBE_COMMAND:string="subscribe";
const UNSUBSCRIBE_COMMAND:string="unsubscribe";
const PUBLISH_MESSAGE_COMMAND:string="publish";
const AKNOWLEDGE_MESSAGE_COMMAND:string="acknowledge";
const MESSAGE_VIEWED_COMMAND:string="view";
const SELF_PUBLISH_MESSAGE_COMMAND:string="self_publish";
const GET_OLDER_MESSAGES_COMMAND:string="get_older_messages";
const GET_OLDER_MESSAGES_COMMAND_RESULT:string="get_older_messages_result";
const GET_NEWEST_MESSAGES_COMMAND:string="get_newest_messages";
const GET_MESSAGES_AFTER_COMMAND:string="get_messages_after";
const GET_NEWEST_MESSAGES_FOR_USER_COMMAND:string="get_newest_messages_for_user";
const GET_NEWEST_MESSAGES_COMMAND_RESULT:string="get_newest_messages_result";
const GET_MESSAGES_AFTER_COMMAND_RESULT:string="get_messages_after_result";
const GET_NEWEST_MESSAGES_FOR_USER_COMMAND_RESULT:string="get_newest_messages_for_user_result";
const DISCONNECT_COMMAND:string="disconnect";


//socket command results
const REFRESH_CHANNELS_COMMAND_RESULT:string="get_subscriptions_result";
const UNSUBSCRIBE_BUTTON_CLICK:string="unsubscribe_button_click";
const CHANNEL_CLICK:string="channel_click";
const UNSUBSCRIBE_COMMAND_RESULT:string="unsubscribe_result";
const UNSUBSCRIBE_COMMAND_RESULT_U:string="unsubscribe_result_u";
const SUBSCRIBE_COMMAND_RESULT:string="subscribe_result";
const SUBSCRIBE_COMMAND_RESULT_COMPONENT:string="subscribe_result_component";
const SUBSCRIBE_COMMAND_RESULT_U:string="subscribe_result_u";

const SOCKET_RECEIVE:string="socketReceive";
const SOCKET_CLOSED:string="socketClosed";

const NEW_MESSAGE="new_message";
const MESSAGE_PUBLISHED="message_published";
const NEW_MESSAGE_PUBLISHED="new_message_published";
const NEW_INCOMING_MESSAGE:string="new_channel_message";
const SET_CHAT:string="set_chat";
const SET_CHAT_DOM:string="set_chat_dom";
const RESET_CHAT:string="reset_chat";
const RESET_CHAT_DOM:string="reset_chat_dom";

const SET_CHANNELS:string="set_channels";
const REMOVE_CHANNEL:string="remove_channel";
const ADD_CHANNEL_DOM:string="add_channel_dom";

const SHOW_MAIN:string="showMain";
const HIDE_MAIN:string="hideMain";

const SHOW_LOGIN:string="showLogin";
const HIDE_LOGIN:string="hideLogin";

const SHOW_REGISTER:string="showRegister";
const HIDE_REGISTER:string="hideRegister";


export {
    REFRESH_CHANNELS_COMMAND,
    REFRESH_CHANNELS_COMMAND_RESULT,
    DISCONNECT_COMMAND,
    SET_CHANNELS,
    ADD_CHANNEL_DOM,
    REMOVE_CHANNEL,
    
    CHANNEL_CLICK,
    UNSUBSCRIBE_BUTTON_CLICK,
    UNSUBSCRIBE_COMMAND,
    UNSUBSCRIBE_COMMAND_RESULT,
    UNSUBSCRIBE_COMMAND_RESULT_U,


    SUBSCRIBE_COMMAND,
    SUBSCRIBE_COMMAND_RESULT,
    SUBSCRIBE_COMMAND_RESULT_COMPONENT,
    SUBSCRIBE_COMMAND_RESULT_U,
    SOCKET_RECEIVE,
    SOCKET_CLOSED,
    SET_CHAT,
    SET_CHAT_DOM,
    RESET_CHAT,
    RESET_CHAT_DOM,
    NEW_INCOMING_MESSAGE,
    NEW_MESSAGE,
    MESSAGE_PUBLISHED,
    NEW_MESSAGE_PUBLISHED,
    AKNOWLEDGE_MESSAGE_COMMAND,
    MESSAGE_VIEWED_COMMAND as VIEW_MESSAGE_COMMAND,
    PUBLISH_MESSAGE_COMMAND,
    SELF_PUBLISH_MESSAGE_COMMAND,
    GET_OLDER_MESSAGES_COMMAND,
    GET_OLDER_MESSAGES_COMMAND_RESULT,
    GET_NEWEST_MESSAGES_COMMAND,
    GET_MESSAGES_AFTER_COMMAND,
    GET_MESSAGES_AFTER_COMMAND_RESULT,
    GET_NEWEST_MESSAGES_COMMAND_RESULT,
    GET_NEWEST_MESSAGES_FOR_USER_COMMAND,
    GET_NEWEST_MESSAGES_FOR_USER_COMMAND_RESULT,
    SHOW_MAIN,
    HIDE_MAIN,
    
    SHOW_LOGIN,
    HIDE_LOGIN,

    SHOW_REGISTER,
    HIDE_REGISTER};