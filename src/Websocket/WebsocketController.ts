// WebSocketController.ts
import { SOCKET_COMMAND } from "../Constants";
import EventBus from "../Components/EventBus";
import { connect, send, close, onMessage, onClose } from "./Websocket";
import { Command } from "../Domain/Commands/Command";
import { createSocketCommand } from "../Adapters/CommandAdapter";
import { SOCKET_CLOSED, SOCKET_RECEIVE } from "../Events";

export class WebSocketController {
  private socket: WebSocket | null = null;
  private url: string;

  constructor(initialUrl: string) {
    this.url = initialUrl;

    // Subscribe to outgoing commands from the EventBus
    EventBus.subscribe(SOCKET_COMMAND, this.handleSocketCommand);

    // Optional: Listen for WebSocket close requests
    EventBus.subscribe(SOCKET_CLOSED, this.handleSocketClosed);
  }

  /**
   * Establishes the WebSocket connection.
   * If already connected, this does nothing.
   */
  public connect(url?: string) {
    if (this.socket) {
      console.warn("WebSocket is already connected.");
      return;
    }

    if (url) {
      this.url = url; // Update URL if provided
    }

    console.log(`Connecting to WebSocket at ${this.url}...`);
    this.initializeWebSocket();
  }

  /**
   * Closes the WebSocket connection.
   */
  public disconnect() {
    if (this.socket) {
      console.log("Disconnecting WebSocket...");
      close();
      this.socket = null;
    } else {
      console.warn("WebSocket is not connected.");
    }
  }

  /**
   * Checks if the WebSocket is currently connected.
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Reconnects the WebSocket.
   */
  public reconnect() {
    console.log("Reconnecting WebSocket...");
    this.disconnect();
    this.connect();
  }

  /**
   * Initializes the WebSocket connection and sets up handlers.
   */
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
        this.socket = null; // Reset the socket
      });
    }
  }

  /**
   * Handles outgoing WebSocket commands from the EventBus.
   */
  private handleSocketCommand = (event: CustomEvent) => {
    console.log("inside handle socket command");
    const command: Command = event.detail;
    const socketCommand = createSocketCommand(command);
    const payload = JSON.stringify(socketCommand);
    console.log("Controller sending command to WebSocket:", payload);
    send(payload); // Send to WebSocket
  };

  /**
   * Handles WebSocket close events triggered by the EventBus.
   */
  private handleSocketClosed = () => {
    console.log("Closing WebSocket connection...");
    this.disconnect();
  };
}
