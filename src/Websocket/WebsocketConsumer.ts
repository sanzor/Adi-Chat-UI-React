// WebSocketConsumer.ts

import { SOCKET_CLOSED, SOCKET_RECEIVE } from "../Events";
import EventBus from "../Components/EventBus";
import messageService from "./MessageService";


class WebSocketConsumer {
  constructor() {
    // Subscribe to incoming messages from EventBus
    EventBus.subscribe(SOCKET_RECEIVE, this.onSocketMessage);

    // Subscribe to WebSocket closure events
    EventBus.subscribe(SOCKET_CLOSED, this.onSocketClosed);
  }

  private onSocketMessage = (event: CustomEvent) => {
    console.log("Consumer received WebSocket message:", event.detail);

    // Delegate message handling to the message service
    messageService.handleMessage(event.detail);
  };

  private onSocketClosed = () => {
    console.log("Consumer received WebSocket close event.");
    // Handle WebSocket closure logic here if needed
  };
}

const webSocketConsumer = new WebSocketConsumer();
export default webSocketConsumer;
