import { IBlade } from './blade';
import { IAbstractComponentParams, AbstractComponent, Component } from '../../common/decorator/component';

import * as html from './app-blade.html';
import './app-blade.css';
import { AppBlades } from '../app-blades/app-blades';

export interface IBladeShowOptions {
   source?: IBlade;
   animate?: boolean;
   minimizeParent?: boolean;
}

export interface IAppBladeParams extends IAbstractComponentParams {
   blade: IBlade;
   options: IBladeShowOptions;
   index: KnockoutObservable<number>;
   isLast: KnockoutObservable<boolean>;
}

@Component({ name: 'app-blade', template: html })
export class AppBlade extends AbstractComponent<IAppBladeParams> {
   public blade: IBlade;
   public options: IBladeShowOptions;
   public bladeInitialAnimation: KnockoutObservable<boolean> = ko.observable(true);
   public index: KnockoutObservable<number>;
   public isLast: KnockoutObservable<boolean>;

   constructor(params: IAppBladeParams) {
      super(params);

      this.blade = params.blade;
      this.options = params.options;
      this.bladeInitialAnimation(params.options && params.options.animate);
      this.index = params.index;
      this.isLast = params.isLast;
   }

   public dispose(): void {
      super.dispose();
   }

   public rendered(): void {
      if (this.options && this.options.animate) {
         setTimeout(() => {
            this.bladeInitialAnimation(false);
         }, 1);
      }
   }

   public getTemplate(): HTMLElement[] {
      return $(this.blade.html).toArray();
   }

   public bladeClicked(data: any, event: JQueryEventObject): void {
      if (!this.blade || this.blade.isAnimated()) {
         return;
      }

      if (AppBlades.sharedInstance.areBusyBlades()) {
         return;
      }

      if (this.blade.isMinimized()) {
         event.preventDefault();
         event.stopPropagation();

         AppBlades.sharedInstance.activateBlade(this.blade);
      }
   }

   public maximize(data: any, event: JQueryEventObject): void {
      event.preventDefault();
      event.stopPropagation();

      this.blade.isMaximized(!this.blade.isMaximized());
   }

   public minimize(data: any, event: JQueryEventObject): void {
      event.preventDefault();
      event.stopPropagation();

      AppBlades.sharedInstance.deactivateBlade(this.blade);
   }

   public back(): void {
      this.blade.onback();
   }
}
