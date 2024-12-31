import { SOCKET_COMMAND } from "../Constants";
import { connect, send, close, onMessage, onClose } from "./Websocket";
import { EventBus } from "../Components/EventBus";
import { Command } from "../Domain/Commands/Command";
import { createSocketCommand } from "../Adapters/CommandAdapter";
import { SOCKET_CLOSED, SOCKET_RECEIVE } from "../Events";

export class WebSocketController {
  private socket: WebSocket | null = null;
  private isConnecting: boolean = false;

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
    this.isConnecting = true;
  
    try {
      this.socket = connect(url);
  
      onMessage(this.socket, this.handleMessage);
      onClose(this.socket, this.handleClose);
  
      this.socket.onopen = () => {
        console.log("WebSocketController: Connection opened.");
        this.isConnecting = false;
      };
  
      this.socket.onerror = (error) => {
        console.error("WebSocketController: Connection error:", error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error("WebSocketController: Failed to connect:", error);
      this.isConnecting = false;
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
    close(); // Properly close the WebSocket using the utility method.
    this.socket = null;
  }
  

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  public reconnect(url: string): void {
    console.log("WebSocketController: Reconnecting...");
    this.disconnect();
    this.connect(url);
  }

  private handleSocketCommand = (event: CustomEvent): void => {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocketController: Cannot send command, WebSocket is not connected.");
      return;
    }

    const command: Command = event.detail;
    const socketCommand = createSocketCommand(command);
    const payload = JSON.stringify(socketCommand);

    console.log("WebSocketController: Sending command to WebSocket:", payload);
    send(payload);
  };

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
    this.eventBus.publishEvent(SOCKET_CLOSED, {});
  };

  private handleSocketClosed = (): void => {
    console.log("WebSocketController: Closing connection via EventBus.");
    this.disconnect();
  };
}
