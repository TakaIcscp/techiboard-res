import { ICacheable } from '../utils/cache';

export function CacheResult() {
   return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      let initialFunction: Function = target[propertyKey];

      descriptor.value = function(...args) {
         let cache = (this as ICacheable).cache;
         let key = cache ? propertyKey + '/' + JSON.stringify(args) : null;
         if (cache && key && cache.exists(key)) {
            return cache.get(key);

         } else {
            let result = initialFunction.apply(this, args);
            if (cache && key) {
               cache.add(key, result);
            }

            return result;
         }
      };
   };
}
