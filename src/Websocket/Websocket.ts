// Websocket.ts
let socket: WebSocket | null = null;

/**
 * Connects to the WebSocket server and returns the WebSocket instance.
 */
export function connect(url: string): WebSocket {
  console.log(`Connecting using url:${url}`);
  if (!socket || socket.readyState === WebSocket.CLOSED) {
    socket = new WebSocket(url);

    // Optional: Add default handlers for debugging
    socket.onopen = () => {console.log("WebSocket connection opened.");}
    socket.onerror = (error) => console.error(`WebSocket error:${error}`);
  }
  return socket;
}

/**
 * Sends data through the WebSocket.
 */
export function send(data: string) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(data);
  } else {
    console.error("WebSocket is not open. Unable to send message:", data);
  }
}

/**
 * Attaches a message handler to the WebSocket.
 */
export function onMessage(socket: WebSocket, callback: (message: MessageEvent) => void) {
  socket.onmessage = callback;
}

/**
 * Attaches a close handler to the WebSocket.
 */
export function onClose(socket: WebSocket, callback: () => void) {
  socket.onclose = callback;
}

/**
 * Closes the WebSocket connection.
 */
export function close() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
