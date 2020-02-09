import { Disposable } from './disposable';
/**
 * Cancellable Promise
 *
 * Example:
 *   function delay<T>(callback: () => T, time: number): Cancellable<T> {
 *      return new Cancellable((resolve) => {
 *          // action to resolve
 *          let timer = setTimeout(() => {
 *              resolve(callback());
 *          }, time);
 *
 *          // action to cancel
 *          return () => {
 *              clearTimeout(timer);
 *          };
 *      });
 *   }
 *
 *   let cancellable = delay(() => "Hello", 1);
 *
 *   To get result:
 *      let result = await cancellable;
 *
 *   To cancel:
 *      cancellable.cancel();
 *      ...
 *      try {
 *          let result = await cancellable;
 *      } catch (error) {
 *          if (error !== Cancellable.CANCELED) {
 *              ...
 *          }
 *      }
 */
export class CancellableError {
}

export class Cancellable<T = any> extends Disposable {
   public static CANCELED: CancellableError = new CancellableError();

   private _promise: Promise<T>;
   private _reject: (reason?: any) => void;
   private _cancel: () => void;

   constructor(action: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => (() => void) | void) {
      super();

      this._promise = new Promise((resolve, reject) => {
         this._reject = reject;
         this._cancel = action(
               // on resolve
               (result) => {
                  this.clear();
                  this.updateCancellable(result);
                  resolve(result);
               },
               // on reject
               (reason) => {
                  this.clear();
                  this.updateCancellable(reason);
                  reject(reason);
               }
            ) as () => void;
      });
   }

   public dispose(): void {
      this.cancel();
   }

   public cancel(): void {
      if (this._cancel) {
         this._cancel();
      }

      if (this._reject) {
         this._promise.catch(() => { });
         this._reject(Cancellable.CANCELED);
      }

      this.clear();
   }

   /* PromiseLike functions */

   public then<TResult1, TResult2>(
               onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
               onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Cancellable<TResult1> {
      return new Cancellable((resolve, reject) => {
         this._promise
            .then((value) => {
               resolve(onfulfilled(value));
            })
            .catch((reason) => {
               if (onrejected) {
                  try {
                     resolve(onrejected(reason) as any as TResult1);
                  } catch (e) {
                     reject(e);
                  }
               } else {
                  reject(reason);
               }
            });

         return () => {
            this.cancel();
         };
      });
   }

   public catch<TResult>(oncatch?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Cancellable<T | TResult> {
      return new Cancellable((resolve, reject) => {
         this._promise
            .then((result) => {
               resolve(result);
            })
            .catch((reason) => {
               try {
                  resolve(oncatch ? oncatch(reason) : reason);
               } catch (e) {
                  reject(e);
               }
            });

         return () => {
            this.cancel();
         };
      });
   }

   /* Promise static functions */
   public static resolve<T>(value: T | PromiseLike<T>): Cancellable<T> {
      return new Cancellable(resolve => {
         resolve(value);
      });
   }

   public static reject<T>(reason: T | PromiseLike<T>): Cancellable<T> {
      return new Cancellable((resolve, reject) => {
         reject(reason);
      });
   }

   /*public static all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>, T10 | PromiseLike<T10>]): Cancellable<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
   public static all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>]): Cancellable<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
   public static all<T1, T2, T3, T4, T5, T6, T7, T8>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>]): Cancellable<[T1, T2, T3, T4, T5, T6, T7, T8]>;
   public static all<T1, T2, T3, T4, T5, T6, T7>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>]): Cancellable<[T1, T2, T3, T4, T5, T6, T7]>;
   public static all<T1, T2, T3, T4, T5, T6>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>]): Cancellable<[T1, T2, T3, T4, T5, T6]>;
   public static all<T1, T2, T3, T4, T5>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>, T5 | PromiseLike<T5>]): Cancellable<[T1, T2, T3, T4, T5]>;
   public static all<T1, T2, T3, T4>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike <T4>]): Cancellable<[T1, T2, T3, T4]>;
   public static all<T1, T2, T3>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): Cancellable<[T1, T2, T3]>;
   public static all<T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): Cancellable<[T1, T2]>;*/
   public static all<T>(values: (T | Cancellable<T>)[]): Cancellable<T[]> {
      return new Cancellable((resolve, reject) => {
         Promise.all(values)
               .then((result) => {
                  resolve(result);
               })
               .catch((reason) => {
                  reject(reason);
               });

         return () => {
            values.forEach(value => {
               if (value instanceof Cancellable) {
                  value.cancel();
               }
            });
         };
      });
   }

   /* Private functions */
   private clear(): void {
      this._reject = null;
      this._cancel = null;
   }

   private updateCancellable(promise): void {
      if (promise && promise instanceof Cancellable) {
         this._cancel = () => {
            this.clear();
            promise.cancel();
         };

         promise.then(() => {
            this.clear();
         }).catch(() => {
            this.clear();
         });
      }
   }
}
