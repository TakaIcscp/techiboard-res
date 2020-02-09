import { SessionApi } from './../../common/api/session-api';
import { ErrorUtils } from '../../common/utils/error-utils';
import { Blade, BladeSize } from '../../components/app-blade/blade';
import { TechboardApi } from '../../common/api/techboard-api';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { IUserGroup } from '../../common/api/session-api';

import * as html from './blade-user-group.html';
import './blade-user-group.css';
import { IBladePackage } from '../../components/app-blades/app-blades';

export interface IBladeUserGroupParams extends IBladePackage {
   userGroup?: IUserGroup;

   onsave?: (newGroup: IUserGroup) => void;
   ondelete?: () => void;
}

interface IPermission {
   name: KnockoutObservable<string>;
}

export class BladeUserGroup extends Blade<IBladeUserGroupParams> {
   public bruceApi: TechboardApi = new TechboardApi();
   public sessionApi: SessionApi = new SessionApi();
   public userGroup: KnockoutObservable<IUserGroup> = ko.observable();

   public name: KnockoutObservable<string> = ko.observable();
   public permissions: KnockoutObservable<IPermission[]> = ko.observable([]);

   private _onsave?: (newGroup: IUserGroup) => void;
   private _ondelete?: () => void;
   private _saveEvent = e => this.save();

   constructor() {
      super();

      this.html = html;
      this.size(BladeSize.Small);

      this.addSubscriptions();
   }

   public dispose(): void {
      super.dispose();
      document.removeEventListener('blade-save-all', this._saveEvent, false);
   }

   public async refreshBlade(params?: IBladeUserGroupParams) {
      super.refreshBlade(params);

      params = params || {};
      this._onsave = params.onsave;
      this._ondelete = params.ondelete;

      this.userGroup(params.userGroup);

      await this.initialize();
   }

   public addSubscriptions(): void {
      this.addDisposable(
         this.userGroup.subscribe(value => {
            if (this.isRefreshing()) return;

            this.initialize();
         })
      );
   }

   public async initialize(): Promise<void> {
      this.isLoading(true);

      try {
         this.title(this.userGroup() ? `${this.userGroup().Name} User Group` : 'New User Group');
         if (this.userGroup()) {
            this.name(this.userGroup().Name);
            this.permissions((this.userGroup().Features || []).map(x => {
               return {
                  name: ko.observable(x)
               };
            }));

         } else {
            this.name(null);
            this.permissions(null);
         }

         document.addEventListener('blade-save-all', this._saveEvent, false);

      } catch (error) {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });

      } finally {
         this.isLoading(false);
      }
   }

   public add(): void {
      let permissions = this.permissions();
      permissions.push({ name: ko.observable('New Permission') });
      this.permissions(permissions);
   }

   public removePermission(permission: IPermission): void {
      let permissions = this.permissions().filter(x => x !== permission);
      this.permissions(permissions);
   }

   public async save(): Promise<void> {
      if (this.isLoading()) {
         return;
      }

      if (!this.name()) {
         AppMessages.showMessage({ type: MessageType.Error, text: `Name can't be empty` });
         return;
      }

      let group: IUserGroup = {
         'ClientAccount.ID': SessionApi.getClientAccount(),
         Name: this.name(),
         ID: this.userGroup() ? this.userGroup().ID : null,
         Features: this.permissions().map(x => x.name())
      };

      try {
         this.isLoading(true);
         group = await this.sessionApi.saveGroup(group);
         this.userGroup(group);

         AppMessages.showMessage({ type: MessageType.Success, text: 'Group successfully saved' });
         if (this._onsave) {
            this._onsave(group);
         }

      } catch (error) {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });

      } finally {
         this.isLoading(false);
      }

      this.initialize();
   }

   public async remove(): Promise<void> 
   {
      
   }

   public isNew(): boolean {
      return !this.userGroup();
   }
}
