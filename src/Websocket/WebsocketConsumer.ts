// WebSocketConsumer.ts

import { EventBus } from "../Components/EventBus";
import { SOCKET_CLOSED, SOCKET_RECEIVE } from "../Events";
import messageService from "./MessageService";


export class WebSocketConsumer {
  constructor(private eventBus:EventBus) {
    // Subscribe to incoming messages from EventBus
    eventBus.subscribe(SOCKET_RECEIVE, this.onSocketMessage);

    // Subscribe to WebSocket closure events
    eventBus.subscribe(SOCKET_CLOSED, this.onSocketClosed);
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
