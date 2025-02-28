// MessageService.ts

import { EventBus } from "../Components/EventBus";
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
    RESET_CHAT,
    SUBSCRIBE_COMMAND_RESULT_COMPONENT,
    GET_NEWEST_MESSAGES_FOR_USER_COMMAND,
    GET_NEWEST_MESSAGES_FOR_USER_COMMAND_RESULT
} from "../Events";

export class MessageService {

  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }
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
    this.eventBus.publishEvent(NEW_INCOMING_MESSAGE, data);
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
        this.eventBus.publishEvent("REFRESH_CHANNELS_COMMAND_RESULT", data.result);
        break;

      case GET_NEWEST_MESSAGES_COMMAND:
        this.handleGetNewestMessagesCommandResult(data.result);
        break;
      
      case GET_NEWEST_MESSAGES_FOR_USER_COMMAND:
        this.handleGetNewestMessagesForUserCommandResult(data.result);
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
      this.eventBus.publishEvent(SUBSCRIBE_COMMAND_RESULT, data);
    } else if (data.user_event_kind === UNSUBSCRIBE_COMMAND) {
      this.eventBus.publishEvent(UNSUBSCRIBE_COMMAND_RESULT_U, data);
    }
  }

  private handleSubscribeCommandResult(data: any) {
    console.log(`Publishing from message service ${SUBSCRIBE_COMMAND_RESULT_COMPONENT}`, data);
    this.eventBus.publishEvent(SUBSCRIBE_COMMAND_RESULT_COMPONENT, data);
  }

  private handleUnsubscribeCommandResult(data: any) {
    console.log("Unsubscribe command result:", data);
    if (data.result === "ok") {
      this.eventBus.publishEvent(UNSUBSCRIBE_COMMAND_RESULT, data);
      this.eventBus.publishEvent(RESET_CHAT, {});
    }
  }

  private handleGetNewestMessagesCommandResult(data: any) {
    console.log("Newest messages received:", data.messages);
    this.eventBus.publishEvent("getNewestMessages", data.messages);
  }

  private handleGetNewestMessagesForUserCommandResult(data: any) {
    console.log("Newest messages for user received:", data);
    this.eventBus.publishEvent(GET_NEWEST_MESSAGES_FOR_USER_COMMAND_RESULT, data);
  }

  private handleGetOlderMessagesCommandResult(data: any) {
    console.log("Older messages received:", data.result);
    this.eventBus.publishEvent("getOlderMessages", data.result);
  }
}
