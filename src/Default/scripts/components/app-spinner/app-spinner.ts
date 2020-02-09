import { AbstractComponent, IAbstractComponentParams } from '../../common/decorator/component';
import { Component } from '../../common/decorator/component';

import * as html from './app-spinner.html';
import './app-spinner.css';

export enum SpinnerStyle {
   Normal = 'Normal',
   Small = 'Small',
   Horizontal = 'Horizontal'
}

export interface IAppSpinnerParams extends IAbstractComponentParams {
   style?: SpinnerStyle | string;
   showBackground?: boolean;
   backgroundTransparent?: boolean;
}

@Component({ name: 'app-spinner', template: html })
export class AppSpinner extends AbstractComponent<IAppSpinnerParams> {
   public isActivated: KnockoutObservable<boolean> = ko.observable(false);
   public style: SpinnerStyle = SpinnerStyle.Normal;
   public showBackground: boolean = true;
   public backgroundTransparent: boolean = false;

   constructor(params: IAppSpinnerParams) {
      super(params);

      if (params.style != null) {
         this.style = typeof params.style == 'string' ? SpinnerStyle[params.style] : params.style;
      }

      if (params.showBackground != null) {
         this.showBackground = params.showBackground;
      }

      if (params.backgroundTransparent != null) {
         this.backgroundTransparent = params.backgroundTransparent;
      }

      requestAnimationFrame(() => {
         this.isActivated(true);
      });
   }

   public dispose(): void {
      super.dispose();
   }
}
