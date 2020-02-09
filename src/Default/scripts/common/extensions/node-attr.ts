import { AbstractAttribute, IAbstractAttributeParams, Attribute } from '../decorator/attribute';

export interface INodeAttrParams extends IAbstractAttributeParams {
   oncreate: (element: HTMLElement) => void;
   ondispose: () => void;
}

@Attribute({ name: 'node-attr' })
export class NodeAttr extends AbstractAttribute<INodeAttrParams> {
   constructor(params: INodeAttrParams) {
      super(params);

      if (params.oncreate) {
         params.oncreate(params.element);
      }
   }

   public dispose(): void {
      if (this.params.ondispose) {
         this.params.ondispose();
      }
   }
}
