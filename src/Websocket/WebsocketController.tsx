// WebSocketController.ts
import { SOCKET_COMMAND } from "../Constants";
import EventBus from "../Components/EventBus";
import { connect, send, close, onMessage, onClose } from "./Websocket";
import { Command } from "../Domain/Commands/Command";
import { createSocketCommand } from "../Adapters/CommandAdapter";
import { SOCKET_CLOSED, SOCKET_RECEIVE } from "../Events";

class WebSocketController {
  private socket: WebSocket | null = null;

  constructor(private url: string) {
    this.initializeWebSocket();

    // Subscribe to outgoing commands from the EventBus
    EventBus.subscribe(SOCKET_COMMAND, this.handleSocketCommand);

    // Optional: Listen for WebSocket close requests
    EventBus.subscribe(SOCKET_CLOSED, this.handleSocketClosed);
  }

  private initializeWebSocket() {
    this.socket = connect(this.url);

    if (this.socket) {
      onMessage(this.socket, (message: MessageEvent) => {
        const parsedData = JSON.parse(message.data); // Parse as needed
        console.log("Controller received WebSocket message:", parsedData);
        EventBus.publishEvent(SOCKET_RECEIVE, parsedData); // Publish to EventBus
      });

      onClose(this.socket, () => {
        console.log("Controller detected WebSocket close.");
        EventBus.publishEvent(SOCKET_CLOSED, {});
      });
    }
  }

  private handleSocketCommand = (event: CustomEvent) => {
    const command: Command = event.detail;
    const socketCommand = createSocketCommand(command);
    const payload = JSON.stringify(socketCommand);
    console.log("Controller sending command to WebSocket:", payload);
    send(payload); // Send to WebSocket
  };

  private handleSocketClosed = () => {
    console.log("Closing WebSocket connection...");
    close();
    this.socket = null;
  };

  public reconnect() {
    console.log("Reconnecting WebSocket...");
    this.handleSocketClosed(); // Clean up existing connections
    this.initializeWebSocket(); // Reinitialize the WebSocket
  }
}

const webSocketController = new WebSocketController("ws://your-websocket-url");
export default webSocketController;
