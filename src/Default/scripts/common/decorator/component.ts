import { Disposable } from '../utils/disposable';
import { SimpleEvent } from '../utils/simple-event';

export interface IComponentParams {
   name: string;
   template: string;
}

export function Component(params: IComponentParams) {
   return (target: any): any => {
      ko.components.register(params.name, {
         viewModel: {
            createViewModel: function(params: IAbstractComponentParams, componentInfo) {
               params = params || {} as IAbstractComponentParams;
               params.element = componentInfo.element as HTMLElement;

               return new (target)(params);
            }
         },
         template: `<!-- ko template: {afterRender: $component.rendered.bind($component)} -->${params.template}<!-- /ko -->`
      });

      return target;
   };
}

export interface IAbstractComponentParams {
   element: HTMLElement;
   oninit: SimpleEvent<any>;
}

export class AbstractComponent<T extends IAbstractComponentParams> extends Disposable {
   protected element: HTMLElement;
   protected oninit: SimpleEvent<any>;
   protected params: T;

   constructor(params: T) {
      super();

      this.element = params.element;
      this.oninit = params.oninit;
      this.params = params;
   }

   public rendered(): void {
      if (this.oninit) {
         this.oninit.trigger();
      }
   }
}
