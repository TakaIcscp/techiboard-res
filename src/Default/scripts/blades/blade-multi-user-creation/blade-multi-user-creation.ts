import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-multi-user-creation.html';
import './blade-multi-user-creation.css';
import { TechboardApi, IProfile } from '../../common/api/techboard-api';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { ErrorUtils } from '../../common/utils/error-utils';
import { IUserGroup, SessionApi, IUserAccessPermission, IUser } from '../../common/api/session-api';
import { BladeUserGroups } from '../blade-user-groups/blade-user-groups';

export interface IBladeMultiUserCreationParams extends IBladePackage 
{
   onsave?: () => void;
}

interface Content
{
   text: KnockoutObservable<string>;
}

const STATE_NEWGROUP = 'group';

// represents the multiple user creation process
export class BladeMultiUserCreation extends Blade<IBladeMultiUserCreationParams> 
{
   public sessionApi: SessionApi = new SessionApi();
   public techApi: TechboardApi = new TechboardApi();
   public loading: KnockoutObservable<boolean> = ko.observable(false);

   public groups: KnockoutObservable<IUserGroup[]> = ko.observable([]);
   public UsersList: KnockoutObservable<Content[]> = ko.observable([]);
   public password: KnockoutObservable<string> = ko.observable("Password1");
   public activated: KnockoutObservable<boolean> = ko.observable(true);

   private _onsave?: () => void;

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Small);
      this.title("Create Multiple Users");
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeMultiUserCreationParams) 
   {
      super.refreshBlade(params);

      this._onsave = params.onsave;
   }

   public refreshUrlState(): void 
   {
      super.refreshUrlState();

      let state = this.urlState().next();
      if (state) {
         switch (state) {
         case STATE_NEWGROUP:
            // new
            this.launchBlade(BladeUserGroups, 
            {
               selectOnly: true,

               onselect: (group: IUserGroup) => 
               {
                  if (this.groups().find(x => x.ID == group.ID)) 
                  {
                     return;
                  }

                  let groups = this.groups();
                  groups.push(group);
                  groups.sort((a, b) => { return a.Name.localeCompare(b.Name); });

                  this.groups(groups);
               }
            });
            break;
         }
      }
   }

   public async save(): Promise<void>
   {
      if (this.isLoading()) 
      {
         return;
      }

      if (this.password() == null || this.password() == "")
      {
         AppMessages.showMessage({ type: MessageType.Error, text: 'Please enter a password!' });
         return;
      }

      if (this.UsersList().length <= 0)
      {
         AppMessages.showMessage({ type: MessageType.Error, text: 'Please create at least one user!' });
         return;
      }

      try 
      {
         this.isLoading(true);

         let access: IUserAccessPermission[] = 
         [{
            'ClientAccount.ID': SessionApi.getClientAccount(),
            'UserGroup.ID': this.groups().map(x => x.ID)
         }];

         console.log(access);

         let areStudents: boolean = this.groups().findIndex(x => x.Name === "Students") != -1;

         // loop through all created users and add groups
         await this.UsersList().forEach(async (u) =>
         {
            let newUser: IUser = 
            {
               ID: u.text(),
   
               IsActivated: true,
               IsDisabled: false,
   
               AccessPermissions: access,
               IsPasswordChangeRequired: false
            };
   
            newUser = await this.sessionApi.addUser(newUser);
            newUser.AccessPermissions = access;

            await this.sessionApi.updateUser(newUser);

            if (areStudents)
            {
               let profile: IProfile =
               {
                  StudentID: newUser.ID
               }
   
               if (areStudents)
               {
                  await this.techApi.updateProfileById(newUser.ID, profile);
               }
            }
         });

         AppMessages.showMessage({ type: MessageType.Success, text: 'Users successfully created' });

         if (this._onsave) 
         {
            this._onsave();
         }
         this.close();
      } 
      catch (error) 
      {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });
      } 
      finally 
      {
         this.isLoading(false);
      }
   }

   public removeContent(content: Content): void
   {
      let contents = this.UsersList().filter(x => x !== content);
      this.UsersList(contents);
   }
   
   public add(): void 
   {
      let contents = this.UsersList();
      contents.push({ text: ko.observable('') });
      this.UsersList(contents);
   }

   public addGroup(): void 
   {
      this.updateState(STATE_NEWGROUP);
   }

   public removeGroup(group: IUserGroup): void 
   {
      let groups = this.groups().filter(x => x !== group);
      this.groups(groups);
   }
}
