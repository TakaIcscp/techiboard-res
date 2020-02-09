import { UrlState } from '../../common/utils/url-state';
import { AbstractComponent, IAbstractComponentParams } from '../../common/decorator/component';
import { IBlade } from '../app-blade/blade';
import { Component } from '../../common/decorator/component';
import { IBladeShowOptions } from '../app-blade/app-blade';

import * as html from './app-blades.html';
import './app-blades.css';
import { AppDropDown } from '../app-dropdown/app-dropdown';

interface IBladeStructure {
   blade: IBlade;
   options: IBladeShowOptions;
}

export interface IBladeOptions extends IBladeShowOptions {
   urlState?: UrlState;
   openingState?: string;

   onclose?: () => void;
   onopened?: (blade: IBlade) => void;
}

export interface IBladePackage {
   bladeOptions?: IBladeOptions;
}

export interface IAppBladesParams extends IAbstractComponentParams {
   initialized: (blades: AppBlades) => void;
}

export interface IBladeConstructor<TPackage extends IBladePackage> {
   new (): IBlade<TPackage>;
}

const ANIMATION_TIMEOUT = 200;

@Component({ name: 'app-blades', template: html })
export class AppBlades extends AbstractComponent<IAppBladesParams> {
   protected blades: KnockoutObservable<IBladeStructure[]> = ko.observable([]);
   public static sharedInstance: AppBlades;
   public openedPopups: KnockoutObservable<number> = AppDropDown.opened;

   private _scrollBox: HTMLElement;

   constructor(params: IAppBladesParams) {
      super(params);

      if (params.initialized) {
         AppBlades.sharedInstance = this;
         params.initialized(this);
      }
   }

   public dispose(): void {
      super.dispose();
      this.closeAllBlades();
   }

   public rendered(): void {
      this._scrollBox = this.element.firstElementChild as HTMLElement;
   }

   public nextBlade(source: IBlade): IBlade {
      let nextBladeIndex = this.blades().findIndex(x => x.blade === source);

      if (nextBladeIndex >= 0 && nextBladeIndex < this.blades().length - 1) {
         let nextBlade = this.blades()[nextBladeIndex + 1];
         return nextBlade.blade;
      }

      return null;
   }

   public async launchBlade<T, TPackage extends IBladePackage>(source: IBlade<TPackage>, bladeType: IBladeConstructor<TPackage>, data?: TPackage): Promise<IBlade<TPackage>> {
      let blade: IBlade;
      let nextBlade = this.nextBlade(source);
      let urlState = data && data.bladeOptions && data.bladeOptions.urlState ? data.bladeOptions.urlState :
                     source && source.urlState && source.urlState() ? source.urlState().mine() : UrlState.sharedInstance().mine();

      if (nextBlade && nextBlade.constructor === bladeType) {
         blade = nextBlade;

      } else {
         this.closeBladesFromTheRight(source);

         blade = new bladeType();
         this.addBlade(blade, { ...data ? data.bladeOptions : null, source: source });
      }

      data = data || {} as TPackage;
      data.bladeOptions = data.bladeOptions || {};

      let onclose = data.bladeOptions.onclose;
      data.bladeOptions.onclose = () => {
         if (source && source.urlState && source.urlState()) {
            if (source.currentState === blade.openingState) {
               source.urlState().reset();
            }
         }

         if (onclose) {
            onclose();
         }
      };
      data.bladeOptions.urlState = urlState;

      let oldState = blade.openingState;
      data.bladeOptions.openingState = source ? source.currentState : null;

      let currentState = data.bladeOptions.openingState;
      if (oldState != currentState || !oldState || !currentState) {
         try {
            blade.isRefreshing(true);
            await blade.refreshBlade(data);

         } finally {
            blade.isRefreshing(false);
         }

         let isAfter = false;
         this.blades().forEach(x => {
            if (x.blade === blade) {
               isAfter = true;

            } else if (isAfter) {
               x.blade.currentState = null;
               x.blade.openingState = null;
            }
         });
      }

      blade.refreshUrlState();

      if (data.bladeOptions.onopened) {
         data.bladeOptions.onopened(blade);
      }

      return blade as IBlade<TPackage>;
   }

   public closeBlade(blade: IBlade): void {
      this.closeBladesFromTheRight(blade);

      let closed = [];
      let blades = this.blades();
      blades = blades.filter(x => {
         if (x.blade !== blade) {
            return true;
         }

         x.blade.dispose();
         if (x.blade.currentPackage && x.blade.currentPackage.bladeOptions && x.blade.currentPackage.bladeOptions.onclose) {
            closed.push(x.blade.currentPackage.bladeOptions.onclose);
         }

         return false;
      });

      this.blades(blades);

      closed.forEach(x => x());

      if (blades.length) {
         let previousBlade = blades[blades.length - 1].blade;
         AppBlades.sharedInstance.activateBlade(previousBlade);
      }
   }

   public closeBladesFromTheRight(blade: IBlade): void {
      let blades = this.blades();
      let onRight = false;
      let closed = [];

      blades = blades.filter(x => {
         if (x.blade === blade) {
            onRight = true;

         } else if (onRight || blade == null) {
            x.blade.dispose();
            if (x.blade.currentPackage && x.blade.currentPackage.bladeOptions && x.blade.currentPackage.bladeOptions.onclose) {
               closed.push(x.blade.currentPackage.bladeOptions.onclose);
            }

            return false;
         }

         return true;
      });

      this.blades(blades);
      closed.forEach(x => x());
   }

   public closeAllBlades(): void {
      this.closeBladesFromTheRight(null);
   }

   public activateBlade(blade: IBlade): void {
      blade.isAnimated(true);
      blade.isMinimized(false);

      setTimeout(() => {
         blade.isAnimated(false);

         this.navigateToRight();
      }, ANIMATION_TIMEOUT);
   }

   public deactivateBlade(blade: IBlade): void {
      blade.isAnimated(true);
      blade.isMinimized(true);

      setTimeout(() => {
         blade.isAnimated(false);
      }, ANIMATION_TIMEOUT);
   }

   public areBusyBlades(): boolean {
      return !!this.blades().find(x => x.blade.isLoadingState() || x.blade.isAnimated());
   }

   private addBlade(blade: IBlade, options?: IBladeShowOptions): void {
      if (AppDropDown.active && !AppDropDown.active.keepOpened) {
         AppDropDown.active.close();
      }

      options = { ...options || {} };

      let needShowAnimation = options.minimizeParent !== true && this.blades().length >= 1;
      if (options.source) {
         let nextBladeIndex = this.blades().findIndex(x => x.blade === options.source);
         if (nextBladeIndex >= 0 && nextBladeIndex < this.blades().length - 1) {
            let nextBlade = this.blades()[nextBladeIndex + 1];

            if (nextBlade.blade.constructor === blade.constructor) {
               needShowAnimation = false;
            }
         }
         this.closeBladesFromTheRight(options.source);
      }

      let blades = this.blades();
      if (blades.length && options.minimizeParent === true) {
         let previousBlade = blades[blades.length - 1].blade;
         this.deactivateBlade(previousBlade);
      }

      blades.push({
         blade: blade,
         options: options
      });
      this.blades(blades);

      if (needShowAnimation) {
         blade.isShowing(true);

         requestAnimationFrame(() => {
            blade.isShowing(false);

            setTimeout(() => {
               if (!options.minimizeParent) {
                  this.navigateToRight();
               }
            }, ANIMATION_TIMEOUT);
         });

      } else {
         requestAnimationFrame(() => {
            if (!options.minimizeParent) {
               this.navigateToRight();
            }
         });
      }
   }

   private navigateToRight(): void {
      if (this._scrollBox) {
         $(this._scrollBox).animate({ scrollLeft: this._scrollBox.scrollWidth });
      }
   }
}
