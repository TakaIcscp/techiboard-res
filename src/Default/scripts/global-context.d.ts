declare namespace $$ {
   export interface IUserGroup {
      "ClientAccount.ID"? : string;
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
   }

   export interface IClientAccount {
      ID: string;
      Name: string;
      Type: string;
      FullName: string;
   }

   export interface ISession {
      AccessPermissions: {
         EnabledFeatures: string[];
         UserGroups: string[];
      },
      'ClientAccount.ID': string;
      ID: string;
      IP: string;
      LastAccessTime: {
         d: number
         hh: number
         m: number
         mm: number
         ss: number
         y: number
      };
      User: IUser;
   }

   export interface ISettings {
      BruceURL: string;
   }

   export interface IVersion {
      Application: string;
      Basics: string;
   }

   let ClientAccount: IClientAccount;
   let PageControlLoaded: string;
   let RQURI: string;
   let RVSuffix: string;
   let Resource: string;
   let Root: string;
   let Session: ISession;
   let Settings: ISettings;
   let Subdomain: string;
   let UIVersion: string;
   let UserInterface: string;
   let Version: IVersion;
}