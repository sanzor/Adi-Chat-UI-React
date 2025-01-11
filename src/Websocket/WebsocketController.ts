import { createSocketCommand } from "../Adapters/CommandAdapter";
import { EventBus } from "../Components/EventBus";
import { SOCKET_COMMAND } from "../Constants";
import { Command } from "../Domain/Commands/Command";
import { SOCKET_CLOSED, SOCKET_RECEIVE } from "../Events";
import { close, connect, onClose, onMessage, send } from "./Websocket";

export class WebSocketController {
  private socket: WebSocket | null = null;
  private isRetrying: boolean = false;
  private static instance: WebSocketController | null = null;

  public static getInstance(eventBus: EventBus): WebSocketController {
    if (!WebSocketController.instance) {
      console.log("WebSocketController: Creating singleton instance...");
      WebSocketController.instance = new WebSocketController(eventBus);
    }
    return WebSocketController.instance;
  }

  constructor(private eventBus: EventBus) {
    this.eventBus.subscribe(SOCKET_COMMAND, this.handleSocketCommand);
    this.eventBus.subscribe(SOCKET_CLOSED, this.handleSocketClosed);
  }

  public connect(url: string): void {
    if (this.socket) {
      if (this.socket.readyState === WebSocket.OPEN) {
        console.warn("WebSocketController: WebSocket is already connected.");
        return;
      }
      if (this.socket.readyState === WebSocket.CONNECTING) {
        console.warn("WebSocketController: WebSocket connection is already in progress.");
        return;
      }
    }

    console.log(`WebSocketController: Connecting to ${url}`);

    try {
      this.socket = connect(url);

      onMessage(this.socket, this.handleMessage);
      onClose(this.socket, this.handleClose);

      this.socket.onopen = () => {
        console.log("WebSocketController: Connection opened.");
        this.isRetrying = false;
        this.eventBus.publishEvent("WEBSOCKET_CONNECTED", {});
      };

      this.socket.onerror = (error) => {
        console.error("WebSocketController: Connection error:", error);
        if (!this.isRetrying) {
          this.eventBus.publishEvent("WEBSOCKET_CONNECTION_FAILED", error);
          this.retryConnection(url);
        }
      };
    } catch (error) {
      console.error("WebSocketController: Failed to connect:", error);
      this.eventBus.publishEvent("WEBSOCKET_CONNECTION_FAILED", error);
    }
  }

  public disconnect(): void {
    if (!this.socket) {
      console.warn("WebSocketController: WebSocket is not connected or already closed.");
      return;
    }

    if (this.socket.readyState === WebSocket.CLOSED) {
      console.warn("WebSocketController: WebSocket is already closed.");
      this.socket = null;
      return;
    }

    console.log("WebSocketController: Disconnecting WebSocket...");
     close();
    this.socket = null;
    this.eventBus.publishEvent("WEBSOCKET_DISCONNECTED", {});
  }

  private retryConnection(url: string): void {
    this.isRetrying = true;
    console.log("WebSocketController: Retrying connection in 3 seconds...");
    setTimeout(() => this.connect(url), 3000); // Retry after 3 seconds
  }

  private handleMessage = (message: MessageEvent): void => {
    console.log("WebSocketController: Message received:", message.data);

    try {
      const parsedData = JSON.parse(message.data);
      this.eventBus.publishEvent(SOCKET_RECEIVE, parsedData);
    } catch (error) {
      console.error("WebSocketController: Failed to parse message:", error);
    }
  };

  private handleClose = (): void => {
    console.log("WebSocketController: Connection closed.");
    this.socket = null;
    this.eventBus.publishEvent("WEBSOCKET_DISCONNECTED", {});
  };

  private handleSocketCommand = (event: CustomEvent): void => {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.log(this.socket?.readyState);
      console.error("WebSocketController: Cannot send command, WebSocket is not connected.");
     
      return;
    }

    const command: Command = event.detail;
    const payload = JSON.stringify(createSocketCommand(command));
    send(payload);
  };

  private handleSocketClosed = (): void => {
    console.log("WebSocketController: Closing connection via EventBus.");
    this.disconnect();
  };
}
