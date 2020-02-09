import { AbstractAttribute, IAbstractAttributeParams, Attribute } from '../decorator/attribute';

export interface IRenderedAttrParams extends IAbstractAttributeParams {
   showStyles: string[];
   onrender: (element: HTMLElement) => void;
}

@Attribute({ name: 'rendered-attr' })
export class RenderedAttr extends AbstractAttribute<IRenderedAttrParams> {
   constructor(params: IRenderedAttrParams) {
      super(params);

      if (params.onrender) {
         params.onrender(params.element);
      }

      setTimeout(() => {
         requestAnimationFrame(() => {
            let element = params.element;

            if (params.showStyles) {
               element.classList.add(...params.showStyles);
            }
         });
      }, 1);
   }
}
