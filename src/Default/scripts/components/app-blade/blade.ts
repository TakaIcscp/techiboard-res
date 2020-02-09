import { IBladeOptions } from '../app-blades/app-blades';
import { UrlState } from '../../common/utils/url-state';
import { AppBlades, IBladeConstructor, IBladePackage } from '../app-blades/app-blades';
import { Disposable } from '../../common/utils/disposable';

export enum BladeSize {
   Tiny = 'tiny',
   Small = 'small',
   Medium = 'medium',
   Normal = 'normal',
   Big = 'big',
   Massive = 'massive'
}

export interface IBlade<TPackage= IBladePackage> extends Disposable {
   html: string;
   zIndex: KnockoutObservable<number>;
   size: KnockoutObservable<BladeSize>;
   title: KnockoutObservable<string>;
   isMinimized: KnockoutObservable<boolean>;
   isAnimated: KnockoutObservable<boolean>;
   isLoadingState: KnockoutObservable<boolean>;
   isMaximized: KnockoutObservable<boolean>;
   isShowing: KnockoutObservable<boolean>;
   isRefreshing: KnockoutObservable<boolean>;
   canMaximize: KnockoutObservable<boolean>;
   urlState: KnockoutObservable<UrlState>;
   currentPackage: TPackage;
   currentState: string;
   openingState: string;
   element: HTMLElement;

   refreshBlade(data: TPackage): Promise<void>;
   refreshUrlState(): void;
   close(): void;

   onback: () => void;
}

export class Blade<TPackage extends IBladePackage> extends Disposable implements IBlade<TPackage> {
   public html: string;
   public zIndex: KnockoutObservable<number> = ko.observable();
   public size: KnockoutObservable<BladeSize> = ko.observable(BladeSize.Normal);
   public title: KnockoutObservable<string> = ko.observable();
   public isMinimized: KnockoutObservable<boolean> = ko.observable(false);
   public isAnimated: KnockoutObservable<boolean> = ko.observable(false);
   public isLoadingState: KnockoutObservable<boolean> = ko.observable(false);
   public isMaximized: KnockoutObservable<boolean> = ko.observable(false);
   public isShowing: KnockoutObservable<boolean> = ko.observable(false);
   public isRefreshing: KnockoutObservable<boolean> = ko.observable(false);
   public canMaximize: KnockoutObservable<boolean> = ko.observable(true);
   public urlState: KnockoutObservable<UrlState> = ko.observable();
   public currentPackage: TPackage;
   public currentState: string;
   public openingState: string;
   public element: HTMLElement;

   private _deferredAmount: number = 0;
   private _previousUrlStateSubscription: KnockoutSubscription;

   constructor() {
      super();

      this.addDisposable(
         this.urlState.subscribe((urlState) => {
            if (this._previousUrlStateSubscription) {
               this._previousUrlStateSubscription.dispose();
               this._previousUrlStateSubscription = null;
            }

            if (urlState) {
               this._previousUrlStateSubscription = urlState.paths.subscribe(value => {
                  this.refreshUrlState();
               });
            }
         })
      );
   }

   public dispose(): void {
      super.dispose();

      if (this._previousUrlStateSubscription) {
         this._previousUrlStateSubscription.dispose();
         this._previousUrlStateSubscription = null;
      }

      if (this.urlState()) {
         this.urlState().dispose();
         this.urlState(null);
      }
   }

   public rendered(element: HTMLElement): void {
      this.element = element;
   }

   public async refreshBlade(data: TPackage): Promise<void> {
      this.currentPackage = data;

      let bladeOptions: IBladeOptions = (data && data.bladeOptions) || {};
      this.openingState = bladeOptions.openingState;
      this.urlState(bladeOptions.urlState);
   }

   public refreshUrlState(): void {
      if (!this.urlState()) return;

      this.urlState().moveToStart();

      let current = this.urlState().read();
      if (!current) {
         this.closeBladesFromTheRight();
         this.activate();

      } else {
         this.currentState = current;
      }
   }

   public launchBlade<T, TPackage>(bladeType: IBladeConstructor<TPackage>, data?: TPackage): Promise<IBlade<TPackage>> {
      return AppBlades.sharedInstance.launchBlade<T, TPackage>(this as any, bladeType, data);
   }

   public isLoading(diff?: number | boolean): boolean {
      if (diff === undefined) return this.isLoadingState();

      this._deferredAmount += typeof diff == 'boolean' ? (diff ? 1 : -1) : diff;

      let isLoading = this._deferredAmount > 0;
      if (this.isLoadingState() != isLoading) {
         this.isLoadingState(isLoading);
      }
   }

   public minimize(): void {
      AppBlades.sharedInstance.deactivateBlade(this);
   }

   public activate(): void {
      AppBlades.sharedInstance.activateBlade(this);
   }

   public close(): void {
      AppBlades.sharedInstance.closeBlade(this);
   }

   public closeBladesFromTheRight(): void {
      AppBlades.sharedInstance.closeBladesFromTheRight(this);
   }

   public onback(): void {
      this.close();
   }

   public updateState(state: string, erase?: boolean) {
      this.currentState = state;

      if (erase) {
         this.urlState().setState(state);
      } else {
         this.urlState().update(state);
      }
   }
}
