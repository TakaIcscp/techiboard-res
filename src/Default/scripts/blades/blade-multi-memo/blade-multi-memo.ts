import { Blade, BladeSize } from '../../components/app-blade/blade';

import * as html from './blade-multi-memo.html';
import './blade-multi-memo.css';
import { TechboardApi, IMemo, IUTC, IProfile, IClass } from '../../common/api/techboard-api';
import { IBladePackage } from '../../components/app-blades/app-blades';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { SessionApi, IUser } from '../../common/api/session-api';
import { IFilterControl } from '../../components/app-complex-search/app-complex-search';
import { GlobalCommunications } from '../../global-communications';

export interface IBladeMultiMemoParams extends IBladePackage 
{
   memo?: KnockoutObservable<IMemo>;
   onsave?: () => void;
}

enum FilterType
{
   dropdown,
   input,
   checkbox
}

interface Filter
{
   id: string;
   type: FilterType;
   option?: KnockoutObservable<any>;
   options?: KnockoutObservable<any[]>;
   operator?: KnockoutObservable<any>;
   operators?: KnockoutObservable<any[]>;
   description: string;
}

export class BladeMultiMemo extends Blade<IBladeMultiMemoParams> 
{
   public sessionApi: SessionApi = new SessionApi();
   public techboardApi: TechboardApi = new TechboardApi();

   public tab: KnockoutObservable<string> = ko.observable("selection");
   public Text: KnockoutObservable<string> = ko.observable(null);

   public users: KnockoutObservable<any[]> = ko.observable([]);
   public addedUsers: KnockoutObservable<any[]> = ko.observable([]);

   public isLoading: KnockoutObservable<boolean> = ko.observable(false);

   public filters: KnockoutObservable<Filter[]> = ko.observable
   ([
      { description: 'Choose a user group that the memo will be restricted to', id: 'User Group', type: FilterType.dropdown, options: ko.observable([]), option: ko.observable(null) },
      { description: 'Choose a diploma that will restrict the memo to', id: 'Diploma', type: FilterType.dropdown, options: ko.observable([]), option: ko.observable(null) },
      { description: 'Choose a class that will restrict the memo to', id: 'Class', type: FilterType.dropdown, options: ko.observable([]), option: ko.observable(null) },
      { description: 'Choose a gender that will restrict the memo to', id: 'Gender', type: FilterType.dropdown, options: ko.observable([ { Name: 'Male' }, { Name: 'Female'} ]), option: ko.observable(null) },
      { description: 'Choose if the users have to be active or not to recieve the memo', id: 'Active', type: FilterType.checkbox, option: ko.observable(true) }
   ]);

   // { description: 'Choose an age and operator that will restrict the memo to', id: 'Age', type: FilterType.input, operators: ko.observable(['<', '>', '=', '>=', '<=', '!=']), option: ko.observable(null), operator: ko.observable('>') },

   public controls: KnockoutObservable<IFilterControl[]> = ko.observable
   ([
      { text: "Remove", icon: "fas fa-times", size: 18, clickEvent: (id: string) => this.removeFilter(id)},
      { text: "Edit", icon: "fas fa-pen", size: 16, clickEvent: (id: string) => 
      {
         this.selectedFilter(this.addedFilters().find(x => x.id == id));
      } }
   ]);

   public selectedFilter: KnockoutObservable<Filter> = ko.observable(null);
   public addedFilters: KnockoutObservable<Filter[]> = ko.observable([]);

   private onsave?: () => void;

   constructor() 
   {
      super();

      this.html = html;
      this.title('Create Memos');
      this.size(BladeSize.Medium);

      if (!GlobalCommunications.isAdmin() && !GlobalCommunications.isTeacher())
      {
         AppMessages.showMessage({ type: MessageType.Error, text: "You don't have the permission requirements to make multi memos." });
         this.close();
      }
   }

   public async Init(): Promise<void>
   {
      this.isLoading(true);
      try
      {
         // get list of groups
         let groups = await this.sessionApi.getUserGroups();
         this.filters().find(x => x.id == 'User Group').options(groups.Items);

         // get list of classes
         let classes = await this.techboardApi.getClassList();
         classes['Classes'].forEach(clas => 
         {
            clas.Name = clas.Tag;   
         });
         this.filters().find(x => x.id == 'Class').options(classes['Classes']);

         // get list of diplomas
         let diplomas = await this.techboardApi.getDiplomaList();
         diplomas['Diplomas'].forEach(diploma => 
         {
            diploma.Name = diploma.Title;   
         });
         this.filters().find(x => x.id == 'Diploma').options(diplomas['Diplomas']);

         this.addFilter(this.filters().find(x => x.id == 'Active'));

         // get list of users
         let data = await this.sessionApi.getUsers();

         let users = <any>data['Items'];
         users.forEach((user) =>
         {
            user.postText = user.FullName != null ? " - " + user.FullName : '';
         });

         this.users(users);
      }
      finally
      {
         this.isLoading(false);
      }
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params: IBladeMultiMemoParams) 
   {
      super.refreshBlade(params);

      this.onsave = params.onsave;

      this.Init();
   }

   public async send(): Promise<void>
   {
      if (this.Text() == "" || this.Text() == null)
      {
         AppMessages.showMessage({ type: MessageType.Error, text: 'Your message cannot be empty.' });
         return;
      }

      this.isLoading(true);

      if (this.tab() == "selection")
      {
         let users: string[] = [];
         for (let i = 0; i < this.addedUsers().length; i++)
         {
            let user: IUser = this.addedUsers()[i];
            users.push(user.ID);
         }

         let memo: IMemo =
         {
            CreatedByUserID: $$.Session.User.ID,
            Seen: false,
            Text: this.Text(),
         }

         await this.techboardApi.postNewMemos(memo, users);
      }
      else
      {
         let users: string[] = [];

         // loop through all users and check if filters let them link with the new memo
         for (let i = 0; i < this.users().length; i++)
         {
            let user: IUser = this.users()[i];
            let profile: IProfile = await this.techboardApi.getProfileById(user.ID);

            let send = true;

            let classes: IClass[] = null;
            for (let filterIndex = 0; filterIndex < this.addedFilters().length; filterIndex++)
            {
               if (!send)
               {
                  break;
               }

               let filter = this.addedFilters()[filterIndex];

               if (filter.id == "Class" || filter.id == "Diploma" && classes == null)
               {
                  let d = await this.techboardApi.getClassesByProfileID(user.ID);
                  classes = d['Classes'];
               }

               switch (filter.id)
               {
                  case "User Group":
                     let groupFound = false
                     for (let j = 0; j < user.AccessPermissions.length; j++)
                     {
                        let permission = user.AccessPermissions[j];
                        if (permission.UserGroups.findIndex(x => x.ID == filter.option().ID) != -1)
                        {
                           groupFound = true;
                        }
                     }
                     if (!groupFound)
                     {
                        send = false;
                     }
                     break;
                  case "Class":
                     if (classes.findIndex(x => x.ID == filter.option().ID) == -1)
                     {
                        send = false;
                     }
                     break;
                  case "Gender":
                     if (filter.option().Name != profile.Gender && !(filter.option().Name == 'Male' && profile.Gender == null))
                     {
                        send = false;
                     }
                     break;
                  case "Age":
                     break;
                  case "Diploma":
                     let diplomaFound = false;
                     for (let j = 0; j < classes.length; j++)
                     {
                        let clas = classes[j];
                        if (clas.DiplomaID == filter.option().ID)
                        {
                           diplomaFound = true;
                           break;
                        }
                     }

                     if (!diplomaFound)
                     {
                        send = false;
                     }
                     break;
                  case "Active":
                     if (user.IsActivated != filter.option())
                     {
                        send = false;
                     }
                     break;
               }
            }

            if (send)
            {
               users.push(user.ID);
            }
         }

         // create new memo record
         let memo: IMemo =
         {
            CreatedByUserID: $$.Session.User.ID,
            Seen: false,
            Text: this.Text()
         }

         // create memo record and send what users need to link to it
         await this.techboardApi.postNewMemos(memo, users);
      }

      this.isLoading(false);

      AppMessages.showMessage({ type: MessageType.Success, text: 'The memos were sent...' });

      if (this.onsave != null)
      {
         this.onsave();
      }
      this.close();
   }

   public changeTab(tab): void
   {
      this.tab(tab);

      this.reset();
   }

   public addUser(user): void
   {
      let added = this.addedUsers();
      let users = this.users();

      added.push(user);
      users.splice(users.findIndex(x => x == user), 1);

      this.users([]);
      this.addedUsers([]);

      this.users(users);
      this.addedUsers(added);
      
   }

   public removeUser(user): void
   {
      let added = this.addedUsers();
      let users = this.users();

      users.push(user);
      added.splice(added.findIndex(x => x == user), 1);

      this.users([]);
      this.addedUsers([]);

      this.users(users);
      this.addedUsers(added);
   }

   public reset(): void
   {
      let added: any[] = this.addedUsers();
      let users: any[] = this.users();

      users.concat(added);

      this.addedUsers([]);
      this.users([]);

      this.users(users);
   }

   public addFilter(filter): void
   {
      let addedFilters: any[] = this.addedFilters();
      let filters: any[] = this.filters();

      addedFilters.push(filter);
      filters.splice(filters.findIndex(x => x == filter), 1);

      this.addedFilters([]);
      this.addedFilters(addedFilters);

      this.filters([]);
      this.filters(filters);

      this.selectedFilter(filter);
   }

   public removeFilter(id): void
   {
      let addedFilters: any[] = this.addedFilters();
      let filters: any[] = this.filters();

      let index = addedFilters.findIndex(x => x.id == id);

      filters.push(addedFilters[index]);
      addedFilters.splice(index, 1);

      this.addedFilters([]);
      this.addedFilters(addedFilters);

      this.filters([]);
      this.filters(filters);

      if (this.selectedFilter().id == id)
      {
         this.selectedFilter(null);
      }
   }
}
