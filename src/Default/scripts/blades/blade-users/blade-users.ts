import { ObjectUtils } from '../../common/utils/object-utils';
import { SessionApi, IUser } from '../../common/api/session-api';
import { Blade, BladeSize } from '../../components/app-blade/blade';
import { BladeUser } from '../blade-user/blade-user';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { ErrorUtils } from '../../common/utils/error-utils';

import * as html from './blade-users.html';
import './blade-users.css';
import { TechboardApi } from '../../common/api/techboard-api';
import { BladeMultiUserCreation } from '../blade-multi-user-creation/blade-multi-user-creation';
import { IFilter } from '../../components/app-complex-search/app-complex-search';
import { GlobalCommunications } from '../../global-communications';

const STATE_NEW = 'new';
const STATE_MULTIPLE = 'multiple';

export interface IBladeIdentityManagementParams 
{
}

export class BladeIdentityManagement extends Blade<IBladeIdentityManagementParams> 
{
   public sessionApi: SessionApi = new SessionApi();
   public bruceApi: TechboardApi = new TechboardApi();
   public data: KnockoutObservable<any[]> = ko.observable([]);
   public selected: KnockoutObservable<IUser> = ko.observable();
   public canEdit: KnockoutObservable<boolean> = GlobalCommunications.isAdmin;

   public filters: KnockoutObservable<IFilter[]> = ko.observable
   ([

   ]);

   constructor() 
   {
      super();

      this.html = html;
      this.title('Users');
      this.size(BladeSize.Small);

      this.addDisposable(this.selected.subscribe((value) =>
      {
         this.select(value);
      }));
   }

   public async refreshBlade(params: IBladeIdentityManagementParams) 
   {
      super.refreshBlade(params);

      await this.initialize();
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public refreshUrlState(): void 
   {
      super.refreshUrlState();

      let state = this.urlState().next();
      if (state) {
         switch (state) 
         {
            case STATE_NEW:
               // new
               this.selected(null);

               this.launchBlade(BladeUser, 
               {
                  onsave: (newUser: IUser) => 
                  {
                     this.selected(newUser);
                     this.initialize();
                  },
                  ondelete: () => 
                  {
                     this.initialize();
                  }
               });
               break;

            case STATE_MULTIPLE:
               // multiple new
               this.selected(null);

               this.launchBlade(BladeMultiUserCreation,
               {
                  onsave: () => 
                  {
                     this.initialize();
                  },
               });
               break;

            default:
               // user
               //let data: IUser = this.data().find(x => ObjectUtils.toId(x.ID) == state);
               //this.selected(data);

               this.launchBlade(BladeUser, 
               {
                  canEdit: GlobalCommunications.CanAccess(),
                  user: this.selected(),
                  onsave: () => 
                  {
                     this.initialize();
                  },
                  ondelete: () => 
                  {
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
         let data = await this.sessionApi.getUsers();

         let users = <any>data['Items'];
         users.forEach((user) =>
         {
            user.postText = user.FullName != null ? " - " + user.FullName : '';
         });

         this.data(users);
      } catch (error) {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });

      } finally {
         this.isLoading(false);
      }
   }

   public addNew(): void 
   {
      this.updateState(STATE_NEW, true);
   }

   public addMultiple(): void 
   {
      this.updateState(STATE_MULTIPLE, true);
   }

   public select(data: IUser): void {
      if (data != null)
      {
         this.updateState(ObjectUtils.toId(data.ID));
      }
   }
}
