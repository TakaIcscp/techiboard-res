export class ObjectUtils {
   public static isEmpty(object: any): boolean {
      if (object == null) {
         return true;
      }

      for (let key in object) {
         return false;
      }

      return true;
   }

   public static firstSimpleValue<T = any>(object: any): T {
      if (object == null) {
         return undefined;
      }

      for (let key in object) {
         let value = object[key];
         if (value == null) {
            continue;
         }

         if (typeof value === 'object') {
            let result = this.firstSimpleValue(value);
            if (result !== undefined) {
               return result;
            }
         }

         return value;
      }

      return undefined;
   }

   public static nvl<T>(value: T, defaultValue: T): T {
      return value == null ? defaultValue : value;
   }

   public static uid(): string {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
         let r = Math.random() * 16 | 0;
         let v = c == 'x' ? r : (r & 0x3 | 0x8);

         return v.toString(16);
      });
   }

   public static objectKey(object: any, value: any): string {
      for (let i in object) {
         if (object[i] === value) {
            return i;
         }
      }

      return null;
   }

   public static center(a: number, b: number): number {
      let min = Math.min(a,b);
      let max = Math.max(a,b);

      return min + (max - min) / 2;
   }

   public static unwrap<T>(params: KnockoutObservable<T> | T): T {
      return ko.isObservable(params) ? params() : params;
   }

   public static wrap<T>(params: KnockoutObservable<T> | T, defaultValue?: T): KnockoutObservable<T> {
      if (defaultValue !== undefined && params == null) {
         return ko.observable(defaultValue);
      }

      return ko.isObservable(params) ? params : ko.observable(params);
   }

   public static jsonParse<T = any>(text: string): T {
      try {
         return JSON.parse(text);

      } catch (e) {
         return null;
      }
   }

   public static structureToJSON(structure: any): any {
      let strJSON = {};
      for (let item of structure) {
         let [k, v, s] = [item.Key, item.value(), item.Structure];
         if (s) {
            strJSON[k] = this.structureToJSON(s);
         } else {
            strJSON[k] = v;
         }
      }
      return strJSON;
   }

   public static isNumber(num: string): boolean {
      if (typeof num === 'number') {
         return num - num === 0;
      }

      if (typeof num === 'string' && num.trim() !== '') {
         return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
      }

      return false;
   }

   public static toId(value: string): string {
      if (!value) return value;

      return (value + '').trim().replace(/[^a-z0-9_-]/gi, '_').replace(/_+/, '_');
   }

   public static toStrictId(value: string): string {
      if (!value) return value;

      return value.trim().replace(/[^a-z0-9_]/gi, '');
   }

   public static toJSONId(values: string[] | string, root?: string): string {
      let result = '';
      if (!values) return '';

      let convert = (x: string) => {
         if (/^[a-z0-9_]+$/i.test(x)) {
            if (result.length) {
               result += '.';
            }

            result += x;

         } else {
            result += `['${x}']`;
         }
      };

      if (typeof values == 'string') {
         convert(values);

      } else {
         values.forEach(x => {
            convert(x);
         });
      }

      if (root && result.charAt(0) == '[') {
         result = `${root}${result}`;
      }

      return result;
   }

   public static parseNum(value: string | number): number {
      let result = parseFloat(value as string);
      return result == null || isNaN(result) ? null : result;
   }
}
