import { BladeUserGroups } from './../blade-user-groups/blade-user-groups';
import { IUser, SessionApi, IUserGroup, IUserAccessPermission } from './../../common/api/session-api';
import { ErrorUtils } from '../../common/utils/error-utils';
import { Blade, BladeSize } from '../../components/app-blade/blade';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-user.html';
import './blade-user.css';
import { TechboardApi, IProfile } from '../../common/api/techboard-api';

const STATE_NEWGROUP = 'group';

export interface IBladeUserParams extends IBladePackage 
{
   id?: string;
   user?: IUser;
   canEdit?: boolean;
   minimal?: boolean;

   onsave?: (user: IUser) => void;
   ondelete?: () => void;
}

export class BladeUser extends Blade<IBladeUserParams> {
   public sessionApi: SessionApi = new SessionApi();
   public techboardApi: TechboardApi = new TechboardApi();

   public minimal: KnockoutObservable<boolean> = ko.observable(false);
   public id: KnockoutObservable<string> = ko.observable(null);
   public password: KnockoutObservable<string> = ko.observable();

   public name: KnockoutObservable<string> = ko.observable();
   public email: KnockoutObservable<string> = ko.observable();
   public mobile: KnockoutObservable<string> = ko.observable();
   public activated: KnockoutObservable<boolean> = ko.observable(false);
   public disabled: KnockoutObservable<boolean> = ko.observable(false);

   public user: KnockoutObservable<IUser> = ko.observable();
   public access: KnockoutObservable<IUserAccessPermission[]> = ko.observable([]);
   public groups: KnockoutObservable<IUserGroup[]> = ko.observable([]);
   public wasChanged: KnockoutObservable<boolean> = ko.observable(false);
   public wasIdOrPasswordChanged: KnockoutObservable<boolean> = ko.observable(false);
   public wasPermissionsChanged: KnockoutObservable<boolean> = ko.observable(false);

   public genders: string[] = ['Male', 'Female', 'Other'];
   public profile: KnockoutObservable<IProfile> = ko.observable(null);
   public gender: KnockoutObservable<string> = ko.observable(null);
   public studentID: KnockoutObservable<string> = ko.observable(null);
   public profileImage: KnockoutObservable<string> = ko.observable(null);
   public position: KnockoutObservable<string> = ko.observable(null);
   public about: KnockoutObservable<string> = ko.observable(null);

   public permissions: KnockoutComputed<string[]> = ko.computed(() => 
   {
      let result: string[] = [];
      let features = {};

      this.groups().forEach(y => {
         if (y.Features) {
            y.Features.forEach(z => {
               if (!(z in features)) {
                  features[z] = 1;
                  result.push(z);
               }
            });
         }
      });

      result.sort((a, b) => { return a.localeCompare(b); });
      return result;
   });

   public canEdit: KnockoutObservable<boolean> = ko.observable(true);
   public canSave: KnockoutComputed<boolean> = ko.computed(() => 
   {
      return this.canEdit() || this.wasPermissionsChanged();
   });

   private _onsave?: (user: IUser) => void;
   private _ondelete?: () => void;
   private _saveEvent = e => this.save();

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Normal);

      this.addSubscriptions();
   }

   public dispose(): void 
   {
      super.dispose();
      document.removeEventListener('blade-save-all', this._saveEvent, false);
   }

   public async refreshBlade(params?: IBladeUserParams) 
   {
      super.refreshBlade(params);

      params = params || {};

      if (params.minimal == true)
      {
         this.size(BladeSize.Small);
         this.minimal(true);
      }
      else
      {
         this.size(BladeSize.Normal);
         this.minimal(false);
      }

      this._onsave = params.onsave;
      this._ondelete = params.ondelete;
      if (params.id != null)
      {
         this.user(await this.sessionApi.getUserById(params.id));
      }
      else
      {
         this.user(params.user);
      }

      if (params.canEdit != null) {
         this.canEdit(params.canEdit);
      }

      await this.initialize();
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
                  this.wasPermissionsChanged(true);
               }
            });
            break;
         }
      }
   }

   public addSubscriptions(): void 
   {
      this.addDisposable(
         this.id.subscribe(x => 
            {
            if (this.isRefreshing()) return;

            this.wasChanged(true);
            this.wasIdOrPasswordChanged(true);
         })
      );

      this.addDisposable(
         this.password.subscribe(x => 
            {
            if (this.isRefreshing()) return;

            this.wasChanged(true);
            this.wasIdOrPasswordChanged(true);
         })
      );

      this.addDisposable(
         this.name.subscribe(x => 
            {
            if (this.isRefreshing()) return;

            this.wasChanged(true);
         })
      );

      this.addDisposable(
         this.email.subscribe(x => 
            {
            if (this.isRefreshing()) return;

            this.wasChanged(true);
         })
      );

      this.addDisposable(
         this.mobile.subscribe(x => 
            {
            if (this.isRefreshing()) return;

            this.wasChanged(true);
         })
      );

      this.addDisposable(
         this.activated.subscribe(x => 
            {
            if (this.isRefreshing()) return;

            this.wasChanged(true);
         })
      );

      this.addDisposable(
         this.disabled.subscribe(x => 
            {
            if (this.isRefreshing()) return;

            this.wasChanged(true);
         })
      );
   }

   public async initialize(): Promise<void>
    {
      if (this.isLoading()) {
         return;
      }

      this.isLoading(true);

      try {
         if (this.user()) 
         {
            this.title(this.user().FullName ? `${this.user().FullName}` : this.user().ID);
            this.id(this.user().ID);
            this.password('***');
            this.name(this.user().FullName);
            this.mobile(this.user().Mobile);
            this.email(this.user().Email);
            this.activated(this.user().IsActivated);
            this.disabled(this.user().IsDisabled);
            this.access(this.user().AccessPermissions);

            let profile: IProfile = await this.techboardApi.getProfileById(this.user().ID);
            this.profile(profile);
            this.studentID(profile.StudentID);
            this.gender(profile.Gender != null ? profile.Gender : this.genders[0]);
            this.about(profile.About);
            this.position(profile.Position);

            if (profile.Image != null && profile.Image != "")
            { 
               let imagePath = null;
               try
               {
                  imagePath = await this.techboardApi.getFileURL(profile.Image);
               }
               finally
               {
                  this.profileImage(imagePath == null || imagePath == "" ? null : imagePath);
               }
            }
            else
            {
               this.profileImage(null);
            }
         } else 
         {
            this.title('New User');
            this.id(null);
            this.password(null);
            this.name(null);
            this.mobile(null);
            this.email(null);
            this.activated(true);
            this.disabled(false);
            this.access(null);

            this.studentID(null);
            this.gender(null);
            this.profile({});
            this.profileImage(null);
            this.about(null);
            this.position(null);
         }

         this.wasChanged(false);
         this.wasIdOrPasswordChanged(false);
         this.wasPermissionsChanged(false);

         this.calculateGroups();

         document.addEventListener('blade-save-all', this._saveEvent, false);

      } catch (error) {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });

      } finally {
         this.isLoading(false);
      }
   }

   public async save(): Promise<void> {
      if (this.isLoading()) {
         return;
      }

      if (this.wasIdOrPasswordChanged() || this.isNew()) {
         if (!this.id() || !this.password()) {
            AppMessages.showMessage({ type: MessageType.Error, text: `Login and Password can't be empty` });
            return;
         }
      }

      try {
         this.isLoading(true);

         let access: IUserAccessPermission[] = [{
            'ClientAccount.ID': SessionApi.getClientAccount(),
            'UserGroup.ID': this.groups().map(x => x.ID)
         }];

         let user: IUser = this.wasChanged() || this.isNew() ? {
            ID: this.id(),

            FullName: this.name(),
            Mobile: this.mobile(),
            Email: this.email(),
            IsActivated: this.activated(),
            IsDisabled: this.disabled(),

            AccessPermissions: access,
            IsPasswordChangeRequired: false

         } : {
            ID: this.id(),
            AccessPermissions: access
         };

         if (this.wasIdOrPasswordChanged()) {
            user.Password = this.password();
         }

         user = this.isNew() ? await this.sessionApi.addUser(user) : await this.sessionApi.updateUser(user);
         this.user(user);

         this.profile().StudentID = this.studentID();
         this.profile().Gender = this.gender();
         this.profile().About = this.about();
         this.profile().Position = this.position();
         let profile = await this.techboardApi.updateProfileById(this.id(), this.profile());
         this.profile(profile);

         AppMessages.showMessage({ type: MessageType.Success, text: 'User successfully saved' });
         if (this._onsave) {
            this._onsave(user);
         }

      } catch (error) {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });

      } finally {
         this.isLoading(false);
      }

      this.initialize();
   }

   public async remove(): Promise<void> {
      if (this.isLoading()) {
         return;
      }

      try {
         this.isLoading(true);

         await this.techboardApi.deleteProfileById(this.user().ID);
         await this.sessionApi.removeUser(this.user().ID);

         AppMessages.showMessage({ type: MessageType.Success, text: 'User successfully removed' });
         if (this._ondelete) {
            this._ondelete();
         }

         this.close();

      } catch (error) {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });

      } finally {
         this.isLoading(false);
      }
   }

   public isNew(): boolean {
      return (this.id() || '') == '' || !this.user();
   }

   public addGroup(): void {
      this.updateState(STATE_NEWGROUP);
   }

   public removeGroup(group: IUserGroup): void {
      let groups = this.groups().filter(x => x !== group);
      this.groups(groups);
      this.wasPermissionsChanged(true);
   }

   private calculateGroups(): void {
      let permissions = this.access() || [];
      let result: IUserGroup[] = [];
      let groups = {};

      permissions.forEach(x => {
         if (x.UserGroups) {
            x.UserGroups.forEach(y => {
               if (!(y.ID in groups)) {
                  groups[y.ID] = 1;
                  result.push(y);
               }
            });
         }
      });

      result.sort((a, b) => { return a.Name.localeCompare(b.Name); });
      this.groups(result);
   }
}
