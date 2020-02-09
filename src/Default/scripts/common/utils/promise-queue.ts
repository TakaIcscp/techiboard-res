import { Disposable } from './disposable';
import { Cancellable } from './cancellable';

export interface IPromiseQueueItem {
   innerCall: () => void;
   outerCall: () => Promise<any> | Cancellable<any>;
   promise: Cancellable<any>;
}

export class PromiseQueue extends Disposable {
   private _active: number = 0;
   private _activeRequests: Cancellable<any>[] = [];
   private _queue: IPromiseQueueItem[] = [];
   private _numberOfItems: number = 8;

   public active: KnockoutObservable<number> = ko.observable(0);
   public queued: KnockoutObservable<number> = ko.observable(0);

   constructor(numberOfItems?: number) {
      super();

      if (numberOfItems) {
         this._numberOfItems = numberOfItems;
      }
   }

   public dispose(): void {
      super.dispose();
      this.cancel();
   }

   public cancel(): void {
      this._queue = [];
      this._activeRequests.forEach(request => {
         request.cancel();
      });

      this._activeRequests = [];
      this._active = 0;

      this.active(this._active);
      this.queued(0);
   }

   public execute<T>(action: () => Promise<any> | Cancellable<any>): IPromiseQueueItem {
      let promise: Cancellable<any> = null;
      let added = false;
      let result: IPromiseQueueItem = {
         innerCall: null,
         outerCall: action,
         promise: null
      };

      if (this._active < this._numberOfItems) {
         promise = action() as Cancellable<any>;

         this._active++;
         this.active(this._active);

         added = true;
         this._activeRequests.push(promise);

      } else {
         promise = new Cancellable((resolve, reject) => {
            let innerPromise;
            let innerFn = () => {
               innerPromise = (action() as Cancellable<T>).then((result) => {
                  resolve(result);

               }).catch((error) => {
                  reject(error);
               });

               this._active++;
               this.active(this._active);

               added = true;
               this._activeRequests.push(innerPromise as Cancellable<any>);
            };

            result.innerCall = innerFn;

            return () => {
               if (innerPromise) {
                  innerPromise.cancel();
               }

               this._queue = this._queue.filter(x => x.innerCall !== innerFn);
               this.queued(this._queue.length);
            };
         });

         this._queue.push(result);
         this.queued(this._queue.length);
      }

      let next = () => {
         if (added) {
            this._active--;
            this.active(this._active);

            added = false;
            this._activeRequests = this._activeRequests.filter(x => x !== promise);
         }

         if (this._active < this._numberOfItems && this._queue.length) {
            let itemInfo = this._queue.shift();
            this.queued(this._queue.length);

            itemInfo.innerCall();
         }
      };

      result.promise = promise.then((result) => {
         next();
         return result;

      }).catch((error) => {
         next();
         throw error;
      });

      return result;
   }

   public remove(item: IPromiseQueueItem): void {
      this._queue = this._queue.filter(x => x !== item);
      this.queued(this._queue.length);
   }
}
