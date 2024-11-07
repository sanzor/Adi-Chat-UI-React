// MessageService.ts
import EventBus from "../Components/EventBus";
import { 
  CHAT,
  COMMAND_RESULT,
  USER_EVENT
} from "../Constants";
import {
    NEW_INCOMING_MESSAGE,
    SUBSCRIBE_COMMAND,
    UNSUBSCRIBE_COMMAND,
    REFRESH_CHANNELS_COMMAND,
    GET_NEWEST_MESSAGES_COMMAND,
    GET_OLDER_MESSAGES_COMMAND,
    SUBSCRIBE_COMMAND_RESULT,
    UNSUBSCRIBE_COMMAND_RESULT,
    UNSUBSCRIBE_COMMAND_RESULT_U,
    RESET_CHAT
} from "../Events";

class MessageService {
  public handleMessage(data: any) {
    switch (data.kind) {
      case CHAT:
        this.handleChatMessage(data);
        break;

      case COMMAND_RESULT:
        this.handleCommandResult(data);
        break;

      case USER_EVENT:
        this.handleUserEvent(data);
        break;

      default:
        console.warn("Unknown message kind:", data.kind);
    }
  }

  private handleChatMessage(data: any) {
    console.log("New chat message received:", data);
    EventBus.publishEvent(NEW_INCOMING_MESSAGE, data.detail);
  }

  private handleCommandResult(data: any) {
    switch (data.command) {
      case SUBSCRIBE_COMMAND:
        this.handleSubscribeCommandResult(data);
        break;

      case UNSUBSCRIBE_COMMAND:
        this.handleUnsubscribeCommandResult(data);
        break;

      case REFRESH_CHANNELS_COMMAND:
        EventBus.publishEvent("REFRESH_CHANNELS_COMMAND_RESULT", data.result);
        break;

      case GET_NEWEST_MESSAGES_COMMAND:
        this.handleGetNewestMessagesCommandResult(data.result);
        break;

      case GET_OLDER_MESSAGES_COMMAND:
        this.handleGetOlderMessagesCommandResult(data.result);
        break;

      default:
        console.warn("Unknown command result:", data.command);
    }
  }

  private handleUserEvent(data: any) {
    if (data.user_event_kind === SUBSCRIBE_COMMAND) {
      EventBus.publishEvent(SUBSCRIBE_COMMAND_RESULT, data);
    } else if (data.user_event_kind === UNSUBSCRIBE_COMMAND) {
      EventBus.publishEvent(UNSUBSCRIBE_COMMAND_RESULT_U, data);
    }
  }

  private handleSubscribeCommandResult(data: any) {
    console.log("Subscribe command result:", data);
    EventBus.publishEvent(SUBSCRIBE_COMMAND_RESULT, data);
  }

  private handleUnsubscribeCommandResult(data: any) {
    console.log("Unsubscribe command result:", data);
    if (data.result === "ok") {
      EventBus.publishEvent(UNSUBSCRIBE_COMMAND_RESULT, data);
      EventBus.publishEvent(RESET_CHAT, {});
    }
  }

  private handleGetNewestMessagesCommandResult(data: any) {
    console.log("Newest messages received:", data.messages);
    EventBus.publishEvent("getNewestMessages", data.messages);
  }

  private handleGetOlderMessagesCommandResult(data: any) {
    console.log("Older messages received:", data.result);
    EventBus.publishEvent("getOlderMessages", data.result);
  }
}

const messageService = new MessageService();
export default messageService;
