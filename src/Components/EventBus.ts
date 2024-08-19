
import { Command } from "../Domain/Commands/Command";

type EventCallback = (data: any) => void;

export class EventBus {
  private eventBus: EventTarget;
  constructor(){
    this.eventBus=new EventTarget();
  }
  subscribe(event: string, callback: EventCallback) {
    this.eventBus.addEventListener(event,callback as EventListener);
  }

  unsubscribe(event: string, callback: EventCallback) {
    this.eventBus.removeEventListener(event,callback as EventListener);
  }

  publishEvent(event: string, data: any) {
    const customEvent=new CustomEvent(event,{detail:data});
    this.eventBus.dispatchEvent(customEvent);
  }
  publishCommand(command:Command){
     const customEvent=new CustomEvent(command.kind,{detail:command});
     return this.eventBus.dispatchEvent(customEvent);
  }
}


export default new EventBus();