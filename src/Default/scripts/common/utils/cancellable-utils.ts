import { Cancellable } from './cancellable';

export class CancellableUtils {
   public static delay(msec: number): Cancellable<void> {
      return new Cancellable((resolve) => {
         let timer = setTimeout(() => {
            resolve();
         }, msec);

         return () => {
            clearTimeout(timer);
         };
      });
   }
}
