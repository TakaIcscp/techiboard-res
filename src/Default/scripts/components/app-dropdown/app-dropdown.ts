import { HTMLUtils } from '../../common/utils/html-utils';
import { ObjectUtils } from '../../common/utils/object-utils';
import { AbstractComponent, IAbstractComponentParams } from '../../common/decorator/component';
import { Component } from '../../common/decorator/component';

import * as html from './app-dropdown.html';
import './app-dropdown.css';

export enum DropDownPosition {
   Left = 'left',
   Center = 'center',
   Right = 'right'
}

const WINDOW_OFFSET = 32;

export interface IAppDropDownParams extends IAbstractComponentParams {
   title: KnockoutObservable<string> | string;
   position: DropDownPosition;

   isOpened: KnockoutObservable<boolean>;
   isLoading: KnockoutObservable<boolean>;
   fixed: boolean;
   canOpen: boolean | KnockoutObservable<boolean>;
   keepOpened: boolean;

   onclick: () => void;
   onopen: () => void;
   onclose: () => void;
   onclickoutside: (element: HTMLElement) => boolean;
}

@Component({ name: 'app-dropdown', template: html })
export class AppDropDown extends AbstractComponent<IAppDropDownParams> {
   public static active: AppDropDown = null;
   public static opened: KnockoutObservable<number> = ko.observable(0);

   public title: KnockoutObservable<string>;
   public isOpened: KnockoutObservable<boolean>;
   public isLoading: KnockoutObservable<boolean>;
   public position: DropDownPosition = DropDownPosition.Left;
   public fixed: boolean = true;
   public canOpen: boolean = true;
   public keepOpened: boolean = false;
   public onclickoutside: (element: HTMLElement) => boolean;

   private _counted: boolean = false;
   private _onopen: () => void;
   private _onclose: () => void;
   private _onclick: () => void;
   private _isNested: boolean = false;

   constructor(params: IAppDropDownParams) {
      super(params);

      this.title = ObjectUtils.wrap(params.title);
      this.isOpened = ObjectUtils.wrap(params.isOpened, false);
      this.isLoading = ObjectUtils.wrap(params.isLoading, false);
      this.onclickoutside = params.onclickoutside;

      if (params.position) {
         this.position = params.position;
      }
      if (params.fixed != null) {
         this.fixed = params.fixed;
      }
      if (params.canOpen != null) {
         this.canOpen = ObjectUtils.unwrap(params.canOpen);
      }
      if (params.keepOpened != null) {
         this.keepOpened = params.keepOpened;
      }

      this._onopen = params.onopen;
      this._onclose = params.onclose;
      this._onclick = params.onclick;

      this.detectNested();
      this.addSubscriptions();

      if (this.isOpened()) {
         this.markAsOpened();
      }
   }

   public static initialize(): void {
      document.addEventListener('mousedown', (event: MouseEvent) => {
         let active = AppDropDown.active;
         let target = event.target as HTMLElement;

         if (active && target && !HTMLUtils.contains(target, active.element)) {
            if (active.onclickoutside && !active.onclickoutside(target)) return;

            active.close();
         }
      }, true);
   }

   public detectNested(): void {
      let parent = $(this.element).parent().closest('app-dropdown');
      this._isNested = parent && parent.length > 0;
   }

   public addSubscriptions(): void {
      this.addDisposable(
         this.isOpened.subscribe(value => {
            if (value) {
               this.markAsOpened();

               if (this._onopen) {
                  this._onopen();
               }

            } else {
               this.count(false);

               if (AppDropDown.active == this || (AppDropDown.active && AppDropDown.active.isOpened === this.isOpened)) {
                  AppDropDown.active = null;
               }

               if (this._onclose) {
                  this._onclose();
               }
            }
         })
      );
   }

   private markAsOpened(): void {
      this.count(true);

      if (!this._isNested) {
         if (AppDropDown.active && AppDropDown.active !== this && AppDropDown.active.isOpened !== this.isOpened) {
            AppDropDown.active.isOpened(false);
            AppDropDown.active = null;
         }

         AppDropDown.active = this;
      }
   }

   private count(visible: boolean): void {
      if (visible) {
         if (!this._counted) {
            this._counted = true;
            AppDropDown.opened(AppDropDown.opened() + 1);
         }
      } else {
         if (this._counted) {
            this._counted = false;
            AppDropDown.opened(AppDropDown.opened() - 1);
         }
      }
   }

   public afterPopupRendered(): void {
      if (this.fixed) {
         requestAnimationFrame(() => {
            let popup: HTMLElement = this.element.querySelector('.popup-block');
            if (popup) {
               // let offsetParent = HTMLUtils.getFixedParent(popup);
               let offset = HTMLUtils.getOffset(popup, document.body);

               let isBottom = false;
               popup.classList.add('popup-block-fixed');
               popup.style.top = offset.top + 'px';

               offset = HTMLUtils.getOffset(popup, document.body);
               if (this.position == DropDownPosition.Right || this.position == DropDownPosition.Center) {
                  if (offset.left + popup.offsetWidth > window.innerWidth) {
                     popup.style.marginLeft = `${window.innerWidth - offset.left - popup.offsetWidth - WINDOW_OFFSET}px`;
                  }
               }

               if (offset.top + popup.offsetHeight + WINDOW_OFFSET > window.innerHeight) {
                  popup.classList.add('popup-bottom-arrow');
                  popup.style.bottom = window.innerHeight - offset.top + 'px';
                  popup.style.top = '';

                  isBottom = true;
               }

               this.element.querySelector('iframe').contentWindow.onresize = () => {
                  if (!isBottom) {
                     popup.style.marginTop = '';

                     let offset = HTMLUtils.getOffset(popup, document.body);
                     if (offset.top + popup.offsetHeight + WINDOW_OFFSET > window.innerHeight) {
                        popup.style.marginTop = `${window.innerHeight - offset.top - popup.offsetHeight - WINDOW_OFFSET}px`;
                     }
                  }
               };
            }
         });
      }
   }

   public dispose(): void {
      super.dispose();

      if (AppDropDown.active && AppDropDown.active === this) {
         AppDropDown.active.isOpened(false);
         AppDropDown.active = null;
      }

      this.count(false);
   }

   public toggleOpened(): void {
      if (this._onclick) {
         this._onclick();
      }

      if (this.canOpen) {
         this.isOpened(!this.isOpened());
      }
   }

   public close(): void {
      this.isOpened(false);
   }

   public static closeAll(): void {
      if (AppDropDown.active) {
         AppDropDown.active.close();
      }
   }
}

AppDropDown.initialize();
