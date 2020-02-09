import { AbstractAttribute, IAbstractAttributeParams, Attribute } from '../decorator/attribute';

export interface IStoreAttrParams extends IAbstractAttributeParams {
}

@Attribute({ name: 'store-attr' })
export class StoreAttr extends AbstractAttribute<IStoreAttrParams> {
   constructor(params: IStoreAttrParams) {
      super(params);

      for (let i in params) {
         if (i !== 'element') {
            params.element[i] = params[i];
         }
      }
   }
}
