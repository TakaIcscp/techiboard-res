import { AbstractAttribute, IAbstractAttributeParams, Attribute } from '../decorator/attribute';

export interface IClickOutsideAttrParams extends IAbstractAttributeParams {
   onclick: () => void;
}

@Attribute({ name: 'click-outside-attr' })
export class ClickOutsideAttr extends AbstractAttribute<IClickOutsideAttrParams> {
   public _event: (event: MouseEvent) => void;

   constructor(params: IClickOutsideAttrParams) {
      super(params);

      this._event = (event: MouseEvent) => {
         let target = event.target as HTMLElement;

         if (!$.contains(this.params.element, target)) {
            if (this.params.onclick) {
               this.params.onclick();
            }
         }
      };

      document.addEventListener('click', this._event, false);
   }

   public dispose(): void {
      document.removeEventListener('click', this._event, false);
   }
}
