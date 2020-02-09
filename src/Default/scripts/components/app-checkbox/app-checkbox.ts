import { AbstractComponent, IAbstractComponentParams, Component } from '../../common/decorator/component';

import * as html from './app-checkbox.html';
import './app-checkbox.css';
import { ObjectUtils } from '../../common/utils/object-utils';

export interface IAppCheckboxParams extends IAbstractComponentParams {
   checked: KnockoutObservable<boolean>;
   enable: KnockoutObservable<boolean> | boolean;

   onchange: (value: boolean) => void;
}

@Component({ name: 'app-checkbox', template: html })
export class AppError extends AbstractComponent<IAppCheckboxParams> {
   public checked: KnockoutObservable<boolean>;
   public enable: KnockoutObservable<boolean>;
   public onchange: (value: boolean) => void;

   constructor(params: IAppCheckboxParams) {
      super(params);

      this.checked = params.checked || ko.observable(false);
      this.enable = ObjectUtils.wrap(params.enable, true);
      this.onchange = params.onchange;
   }

   public dispose(): void {
      super.dispose();
   }

   public check(): void {
      if (!this.enable()) {
         return;
      }

      this.checked(!this.checked());

      if (this.onchange) {
         this.onchange(this.checked());
      }
   }
}
