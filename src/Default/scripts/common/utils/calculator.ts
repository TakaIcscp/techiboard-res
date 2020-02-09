import { IDictionary } from './dictionary';

interface IParsedFormula {
   expression: string;
   mathCode: any;
   params: string[];
}

const ROOT_NAME = 'entity';

export class Calculator {
   private _formulas: IDictionary<IParsedFormula> = {};

   public calcFormula(entity: IDictionary<any>, expression: string): any {
      try {
         let formula = this.parseFormula(expression);
         let code = formula.mathCode;

         if (!code) return null;

         let scope = {
            [ROOT_NAME]: entity || {},
            ...entity
         };

         let result = code.eval(scope);
         return result;

      } catch (e) {
         return undefined;
      }
   }

   private parseFormula(expression: string): IParsedFormula {
      let cache = this._formulas[expression];
      if (cache) return cache;

      let result: IParsedFormula = null;

      try {
         let math = (window as any).math;
         let node = math.parse(expression);
         let code = node.compile();
         let params: string[] = [];

         result = {
            mathCode: code,
            expression: expression,
            params: params
         };

      } catch (e) {
         result = {
            mathCode: null,
            expression: expression,
            params: null
         };
      }

      this._formulas[expression] = result;

      return result;
   }
}
