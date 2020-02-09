import { IDictionary } from './dictionary';

export class Cache<T = any> {
   private _values: IDictionary<any> = {};
   public enabled: boolean = true;

   public clear(): void {
      this._values = {};
   }

   public add<T>(key: string, value: T): void {
      if (this.enabled) {
         this._values[key] = value;
      }
   }

   public get<T>(key: string): T {
      return this._values[key];
   }

   public exists(key: string): boolean {
      return key in this._values;
   }
}

export interface ICacheable {
   cache: Cache;
}
