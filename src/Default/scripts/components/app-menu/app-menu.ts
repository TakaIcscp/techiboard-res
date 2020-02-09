import { AbstractComponent, IAbstractComponentParams } from '../../common/decorator/component';
import { Component } from '../../common/decorator/component';
import { UrlState } from '../../common/utils/url-state';

import * as html from './app-menu.html';
import './app-menu.css';
import { Blade } from '../app-blade/blade';
import { AppBlades, IBladeConstructor } from '../app-blades/app-blades';

export interface IAppMenuParams extends IAbstractComponentParams {
   initialBlade: IBladeConstructor<any>;
   urlState: UrlState;
}

@Component({ name: 'app-menu', template: html })
export class AppMenu extends AbstractComponent<IAppMenuParams> {
   public initialBlade: IBladeConstructor<any>;
   public urlState: UrlState;

   constructor(params: IAppMenuParams) {
      super(params);

      this.initialBlade = params.initialBlade;
      this.urlState = params.urlState;
   }

   public dispose(): void {
      super.dispose();
   }

   public initialized(): void {
      AppBlades.sharedInstance.launchBlade(null, this.initialBlade, { bladeOptions: { urlState: this.urlState.mine() } });
   }
}
