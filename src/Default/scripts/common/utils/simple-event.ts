import { Disposable } from './disposable';

type EventCallback<T> = (value: T) => void;

export abstract class EventSubscription extends Disposable {
}

export class SimpleEvent<T> extends Disposable {
   private _listeners: EventCallback<T>[] = [];

   public dispose(): void {
      this._listeners = [];
   }

   public subscribe(callback: EventCallback<T>): EventSubscription {
      let parent = this;
      this._listeners.push(callback);

      return new class extends EventSubscription {
         public dispose(): void {
            super.dispose();
            parent._listeners = parent._listeners.filter(x => x != callback);
         }
      };
   }

   public trigger(value?: T): void {
      this._listeners.forEach(x => x(value));
   }
}
