import { BladeUserGroup } from './../blade-user-group/blade-user-group';
import { IUserGroup, SessionApi } from './../../common/api/session-api';
import { Blade, BladeSize } from '../../components/app-blade/blade';
import { TechboardApi } from '../../common/api/techboard-api';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { ErrorUtils } from '../../common/utils/error-utils';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-user-groups.html';
import './blade-user-groups.css';
import { ObjectUtils } from '../../common/utils/object-utils';

const STATE_NEW = 'new';

export interface IBladeUserGroupsParams extends IBladePackage {
   selectOnly?: boolean;

   onselect?: (group: IUserGroup) => void;
}

export class BladeUserGroups extends Blade<IBladeUserGroupsParams> {
   public bruceApi: TechboardApi = new TechboardApi();
   public sessionApi: SessionApi = new SessionApi();
   public data: KnockoutObservable<IUserGroup[]> = ko.observable([]);
   public selected: KnockoutObservable<IUserGroup> = ko.observable();
   public selectOnly: boolean = false;
   
   public filteredData: KnockoutObservable<any[]> = ko.observable([]);
   public filteredSelected: KnockoutObservable<any> = ko.observable();

   private _onselect?: (group: IUserGroup) => void;

   constructor() {
      super();

      this.html = html;
      this.title('User Groups');
      this.size(BladeSize.Small);

      this.addDisposable(this.filteredSelected.subscribe((value) =>
      {
         this.select(this.data().find(x => x.ID == value.id));
      }));
   }

   public dispose(): void {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeUserGroupsParams) {
      super.refreshBlade(params);

      params = params || {};
      if (params.selectOnly != null) {
         this.selectOnly = params.selectOnly;
      }
      this._onselect = params.onselect;

      await this.initialize();
   }

   public refreshUrlState(): void {
      super.refreshUrlState();

      let state = this.urlState().next();
      if (state) {
         switch (state) {
         case STATE_NEW:
               // new
            this.selected(null);

            this.launchBlade(BladeUserGroup, {
               onsave: (newGroup: IUserGroup) => {
                  this.selected(newGroup);
                  this.initialize();
               },
               ondelete: () => {
                  this.initialize();
               }
            });
            break;
         default:
               // group
            let data: IUserGroup = this.data().find(x => ObjectUtils.toId(x.ID) == state);
            this.selected(data);

            this.launchBlade(BladeUserGroup, {
               userGroup: data,
               onsave: () => {
                  this.initialize();
               },
               ondelete: () => {
                  this.selected(null);
                  this.initialize();
               }
            });
            break;
         }
      }
   }

   public async initialize(): Promise<void> {
      this.isLoading(true);

      try {
         let data = await this.sessionApi.getUserGroups();
         this.data(data.Items);

         let filteredData = [];
         this.data().forEach((value) =>
         {
            filteredData.push
            (
               {
                  id: value.ID,
                  name: value.Name,
               }
            );
         });
         this.filteredData(filteredData);

      } catch (error) {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });

      } finally {
         this.isLoading(false);
      }
   }

   public addNew(): void {
      this.updateState(STATE_NEW, true);
   }

   public select(data: IUserGroup): void {
      if (this.selectOnly) {
         if (this._onselect) {
            this._onselect(data);
         }

         this.close();
         return;
      }

      this.updateState(ObjectUtils.toId(data.ID));
   }
}
