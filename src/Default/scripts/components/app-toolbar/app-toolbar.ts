import { AbstractComponent, IAbstractComponentParams } from '../../common/decorator/component';
import { Component } from '../../common/decorator/component';
import { IBlade } from '../app-blade/blade';

import * as html from './app-toolbar.html';
import './app-toolbar.css';
import { SessionApi } from '../../common/api/session-api';

export interface IAppToolbarParams extends IAbstractComponentParams 
{

}

@Component({ name: 'app-toolbar', template: html })
export class AppToolbar extends AbstractComponent<IAppToolbarParams> 
{
   public sessionApi: SessionApi = new SessionApi();

   constructor(params: IAppToolbarParams) 
   {
      super(params);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async logout(): Promise<void>
   {
      await this.sessionApi.logout();

      document.location.reload();
   }

   public getLogo(): string
   {
      return $$.Root + '/Default/media/b-logo-600.png';
   }
}
