import { Disposable } from '../utils/disposable';

export interface IAttributeParams {
   name: string;
}

export function Attribute(params: IAttributeParams) {
   return (target: any): any => {
      ko.bindingHandlers[params.name] = {
         init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            let params = valueAccessor();
            (params as IAbstractAttributeParams).element = element;

            let attribute: AbstractAttribute<any> = new target(params);

            ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
               attribute.dispose();
            });
         }
      };

      return target;
   };
}

export interface IAbstractAttributeParams {
   element: HTMLElement;
}

export class AbstractAttribute<T extends IAbstractAttributeParams> extends Disposable {
   public params: T;

   constructor(params: T) {
      super();

      this.params = params;
   }
}
