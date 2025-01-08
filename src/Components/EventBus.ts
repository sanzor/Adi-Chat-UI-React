
  import { SOCKET_COMMAND } from "../Constants";
  import { Command } from "../Domain/Commands/Command";

  type EventCallback = (data: any) => void;

  export class EventBus {
    private eventBus: EventTarget;
    constructor(){
      this.eventBus=new EventTarget();
    }
    subscribe(event: string, callback: EventCallback) {
      console.log(`subscribing to event ${event}`);
      this.eventBus.addEventListener(event,callback as EventListener);
    }

    unsubscribe(event: string, callback: EventCallback) {
      console.log(`unsubscribing from event ${event}`);
      this.eventBus.removeEventListener(event,callback as EventListener);
    }

    publishEvent(event: string, data: any) {
      console.log(`publishing event ${event}`);
      const customEvent=new CustomEvent(event,{detail:data});
      this.eventBus.dispatchEvent(customEvent);
    }
    publishCommand(command:Command){
      console.log(`publishing command ${JSON.stringify(command)}`);
      const customEvent=new CustomEvent(SOCKET_COMMAND,{detail:command});
      return this.eventBus.dispatchEvent(customEvent);
    }
  }


  export default new EventBus();