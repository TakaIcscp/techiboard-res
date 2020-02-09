import { IList } from './techboard-api';
import { Cancellable } from '../utils/cancellable';
import { AbstractApi, SESSION_ID_NAME } from './abstract-api';
import { IClientAccount } from './cam-api';

export interface IUserGroup {
   'ClientAccount.ID'?: string;
   Features: string[];
   ID: string;
   Name?: string;
}

export interface IUserAccessPermission {
   'ClientAccount.ID': string;
   'UserGroup.ID'?: string[];
   UserGroups?: IUserGroup[];
}

export interface IUser {
   AccessPermissions?: IUserAccessPermission[];
   Email?: string;
   FullName?: string;
   ID?: string;
   IsActivated?: boolean;
   IsDisabled?: boolean;
   IsPasswordChangeRequired?: boolean;
   Mobile?: string;
   Password?: string;
   studentID?: number; // not part of interface, used as temporary movement
}

export const ANONYMOUS_USER = 'anonymous';

export class SessionApi extends AbstractApi {
   public static BASE_URL = $$.Root;

   constructor() {
      super();
   }

   public static getClientAccount(): string {
      if ($$.ClientAccount) {
         return $$.ClientAccount.ID;
      }

      if ($$.Session && $$.Session['ClientAccount.ID']) {
         return $$.Session['ClientAccount.ID'];
      }

      return null;
   }

   public login(login: string, password: string): Cancellable<any> {
      return this.request({
         type: 'POST',
         url: SessionApi.BASE_URL + '@IDM/login',
         data: JSON.stringify({
            account: SessionApi.getClientAccount(),
            login: login,
            password: password
         })
      });
   }

   public logout(): Cancellable<any> {
      return this.request({
         type: 'POST',
         url: SessionApi.BASE_URL + '@IDM/logout'
      });
   }

   public getUsers(exclude?: string): Cancellable<IList<IUser>> {
      return this.request({
         type: 'GET',
         url: SessionApi.BASE_URL + '@IDM/users' + (exclude ? `?allExcludingClientAccount=${exclude}` : '')
      });
   }

   public getUserById(id: string): Cancellable<IUser> {
      return this.request({
         type: 'GET',
         url: SessionApi.BASE_URL + '@IDM/user/' + id
      });
   }

   public getUserGroups(): Cancellable<IList<IUserGroup>> {
      return this.request({
         type: 'GET',
         url: SessionApi.BASE_URL + `@IDM/userGroups/${SessionApi.getClientAccount()}`
      });
   }

   public addUser(user: IUser): Cancellable<IUser> {
      return this.request({
         type: 'POST',
         url: SessionApi.BASE_URL + `@IDM/user`,
         data: JSON.stringify(user)
      });
   }

   public updateUser(user: IUser): Cancellable<IUser> {
      return this.request({
         type: 'POST',
         url: SessionApi.BASE_URL + `@IDM/user/${user.ID}`,
         data: JSON.stringify(user)
      });
   }

   public updatePassword(user: IUser): Cancellable<any> 
   {
      return this.request
      ({
         type: 'POST',
         url: SessionApi.BASE_URL + `@IDM/user/updatepassword`,
         data: JSON.stringify(user)
      });
   }

   public removeUser(userId: string): Cancellable<IUser> {
      return this.request({
         type: 'DELETE',
         url: SessionApi.BASE_URL + `@IDM/user/${userId}`
      });
   }

   public saveGroup(group: IUserGroup): Cancellable<IUserGroup> {
      return this.request({
         type: 'POST',
         url: SessionApi.BASE_URL + `@IDM/userGroup` + (group.ID ? `/${group.ID}` : ''),
         data: JSON.stringify(group)
      });
   }

   public getManagedClientAccounts(): Cancellable<IList<IClientAccount>> {
      return this.request({
         type: 'GET',
         url: SessionApi.BASE_URL + `@IDM/user/ownedClientAccounts`
      });
   }
}
