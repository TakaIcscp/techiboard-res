import { AbstractComponent, IAbstractComponentParams, Component } from '../../common/decorator/component';

import * as html from './app-input.html';
import './app-input.css';
import { ObjectUtils } from '../../common/utils/object-utils';

export interface IAppInputParams extends IAbstractComponentParams {
   allowsOnlyNames: KnockoutObservable<boolean>;
   value: KnockoutObservable<string>;
   disable: KnockoutObservable<boolean> | boolean;
   isPass?: KnockoutObservable<boolean> | boolean;
   isNum?: KnockoutObservable<boolean> | boolean;
}

@Component({ name: 'app-input', template: html })
export class AppInput extends AbstractComponent<IAppInputParams> {
   public allowsOnlyNames: KnockoutObservable<boolean>;
   public value: KnockoutObservable<string>;
   public disable: KnockoutObservable<boolean>;
   public isPass: KnockoutObservable<boolean>;
   public isNum: KnockoutObservable<boolean>;

   constructor(params: IAppInputParams) {
      super(params);

      this.allowsOnlyNames = ObjectUtils.wrap(params.allowsOnlyNames, false);
      this.value = ObjectUtils.wrap(params.value);
      this.disable = ObjectUtils.wrap(params.disable, false);
      this.isPass = ObjectUtils.wrap(params.isPass, false);
      this.isNum = ObjectUtils.wrap(params.isNum, false);
   }

   public dispose(): void {
      super.dispose();
   }

   public onkeydown(data: any, event: JQueryEventObject) {
      if (this.allowsOnlyNames()) {
         let regexpString = '[a-zA-Z0-9_-]';
         let regexp = new RegExp(regexpString);
         if (regexp.test(event.key)) {
            return true;
         }

      } else {
         return true;
      }
   }
}
