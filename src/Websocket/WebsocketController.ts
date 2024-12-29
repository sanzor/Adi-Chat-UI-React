import { SOCKET_COMMAND} from "../Constants";
import EventBus from "../Components/EventBus";
import { connect, send, close, onMessage, onClose } from "./Websocket";
import { Command } from "../Domain/Commands/Command";
import { createSocketCommand } from "../Adapters/CommandAdapter";
import { SOCKET_CLOSED, SOCKET_RECEIVE } from "../Events";

export class WebSocketController {
  private static instance: WebSocketController | null = null;
  private socket: WebSocket | null = null;
  private isConnecting: boolean = false;

  private constructor() {
    // Subscribe to outgoing commands from the EventBus
    EventBus.subscribe(SOCKET_COMMAND, this.handleSocketCommand);

    // Subscribe to WebSocket close events
    EventBus.subscribe(SOCKET_CLOSED, this.handleSocketClosed);
  }

  /**
   * Singleton getter for the WebSocketController instance.
   */
  public static getInstance(): WebSocketController {
    if (!WebSocketController.instance) {
      WebSocketController.instance = new WebSocketController();
    }
    return WebSocketController.instance;
  }

  /**
   * Establishes the WebSocket connection. If already connected, it does nothing.
   */
  public connect(url: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.warn("WebSocket is already connected.");
      return;
    }

    if (this.isConnecting) {
      console.warn("WebSocket connection is already in progress.");
      return;
    }

    console.log(`WebSocketController: Connecting to ${url}`);
    this.isConnecting = true;

    try {
      this.socket = connect(url);

      // Add message and close handlers
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

  /**
   * Closes the WebSocket connection.
   */
  public disconnect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log("WebSocketController: Disconnecting WebSocket...");
      close();
      this.socket = null;
    } else {
      console.warn("WebSocketController: WebSocket is not connected or already closed.");
    }
  }

  /**
   * Checks if the WebSocket is currently connected.
   */
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Reconnects the WebSocket connection by first disconnecting it.
   */
  public reconnect(url: string): void {
    console.log("WebSocketController: Reconnecting...");
    this.disconnect();
    this.connect(url);
  }

  /**
   * Handles outgoing WebSocket commands from the EventBus.
   */
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

  /**
   * Handles incoming messages from the WebSocket.
   */
  private handleMessage = (message: MessageEvent): void => {
    console.log("WebSocketController: Message received:", message.data);

    try {
      const parsedData = JSON.parse(message.data); // Adjust parsing as needed
      EventBus.publishEvent(SOCKET_RECEIVE, parsedData);
    } catch (error) {
      console.error("WebSocketController: Failed to parse message:", error);
    }
  };

  /**
   * Handles the WebSocket close event.
   */
  private handleClose = (): void => {
    console.log("WebSocketController: Connection closed.");
    this.socket = null;
    EventBus.publishEvent(SOCKET_CLOSED, {});
  };

  /**
   * Handles WebSocket close events triggered by the EventBus.
   */
  private handleSocketClosed = (): void => {
    console.log("WebSocketController: Closing connection via EventBus.");
    this.disconnect();
  };
}
