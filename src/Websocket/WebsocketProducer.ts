// WebSocketProducer.ts
import { SOCKET_COMMAND } from "../Constants";
import { Command } from "../Domain/Commands/Command";
import EventBus from "../Components/EventBus";

class WebSocketProducer {
  constructor() {
    // Other initialization if needed
  }

  // API to publish commands to the EventBus
  public produceCommand(command: Command) {
    console.log("Producing command:", command);
    EventBus.publishEvent(SOCKET_COMMAND, command);
  }
}

const webSocketProducer = new WebSocketProducer();
export default webSocketProducer;
