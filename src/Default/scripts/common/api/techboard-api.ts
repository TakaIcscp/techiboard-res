import { SessionApi } from './session-api';
import { IDictionary } from '../utils/dictionary';
import { ObjectUtils } from '../utils/object-utils';
import { AbstractApi } from './abstract-api';
import { Cancellable } from '../utils/cancellable';
import { IBounds } from '../utils/bounds';
import { CacheResult } from '../decorator/cache';
import { IClientAccount } from './cam-api';

export interface IList<T> 
{
   Items: T[];
   TotalCount?: number;
}

export interface IUTC 
{
   d: number;
   hh: number;
   m: number;
   mm: number;
   ss: number;
   y: number;
}

export interface IFile 
{
   UploadedTimeUTC: IUTC;
   FileExt: string;
   ID: string;
   MIMEType: string;
   OriginalFileName: string;
   OriginalLength: number;
   'UploadedByUser.ID': string;
}

export interface IClass
{
   ID?: number,
   DiplomaID?: number,
   TimeBracketID?: number,
   Tag: string,
   Active?: boolean,
   Graduated?: boolean
}

export interface IClassProfileLink
{
   ID?: number,
   ClassID: number,
   ProfileID: string,
   Type?: string
}

export interface INotice
{
   ID?: number,
   'CreatedByUserID'?: string,
   Image?: string,
   Text?: string,
   SubText?: string,
   Styling?: any,
   Active?: boolean
}

export interface IDiploma
{
   ID?: number,
   Level?: number,
   Title?: string,
   Duration?: number,
   Credits?: number,
   NZQAApproved?: boolean,
   Contents?: any,
   TimeBracketID?: number
}

export interface IDiplomaTimeBracket
{
   ID?: number,
   StartDate: IUTC,
   EndDate: IUTC,
   Type?: string
}

export interface IProfile
{
   ID?: string,
   StudentID?: string,
   Tag?: string,
   Image?: string,
   Position?: string,
   About?: string,
   Gender?: string
}

export interface IResource 
{
   UploadedTimeUTC: IUTC;
   FileExt: string;
   ID: string;
   MIMEType: string;
   OriginalFileName: string;
   OriginalLength: number;
   'UploadedByUser.ID': string;
}

export interface IVersionLog
{
   ID?: number,
   CreatedByUserID?: string,
   Version?: string,
   Tag?: string,
   Contents?: string
}

export interface IMemo
{
   ID?: number,
   CreatedByUserID?: string,
   Text?: string,
   SentTime?: IUTC,
   Seen?: boolean,
   ForUserID?: string;
   Attachments?: string[]
}

export interface ISetting
{
   ID?: number,
   ForUserID?: string,
   Contents?: any,
   Tag?: string
}

export interface IClientResource
{
   ID?: number,
   Tag: string,
   Type: string,
   ResourceID: string;
   Description?: string;
}

export interface IAssessment
{
   ID?: number;
   Tag?: string;
   ClassID?: number;
   Date?: IUTC;
}

export interface IAssessmentProfileLink
{
   ID?: number;
   ProfileID?: string;
   AssessmentID?: number;
   Marks?: string;
   LetterMark?: string;
   Passed?: boolean;
   ResitDate?: IUTC;
   ResitCompleted?: boolean;
}

export class TechboardApi extends AbstractApi 
{
   public static URL = $$.Settings.BruceURL.replace('${clientAccount}', SessionApi.getClientAccount());

   constructor() 
   {
      super();
   }

    /**
     * Requests CAM to create new Client Account.
     */
   public createAccount(id: string, name: string): Cancellable<IClientAccount> 
   {
      let post = 
      {
         'Name': name
      };

      return this.request({
         type: 'POST',
         url: TechboardApi.URL + `clientAccount/` + id,
         data: JSON.stringify(post)
      });
   }

   public getUsersByGroup(group: string): Cancellable<any>
   {
      return this.request({
         type: "GET",
         url: SessionApi.BASE_URL + '@IDM/users/' + group
      });
   }

   /// CLASS REQUESTS ///

   // Gets a list of all classes that the current logged in user can view
   public getClassList(): Cancellable<any>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `classes`
      });
   }

   // gets a single class record by given id
   public getClassById(Id): Cancellable<IClass>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `class/` + Id
      });
   }

   // creates a new class record from given class
   public postNewClass(clas: IClass): Cancellable<IClass>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `class`,
         data: JSON.stringify(clas)
      });
   }

   // updates a class record matching given id using given class
   public postUpdateClass(Id, clas: IClass): Cancellable<IClass>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `class/` + Id,
         data: JSON.stringify(clas)
      });
   }

   // deletes a class record matching a given id
   public deleteClassById(Id): Cancellable<any>
   {
      return this.request({
         type: "DELETE",
         url: TechboardApi.URL + `class/` + Id
      });
   }

   // updates a class profile link record from given class id and profile id
   public postClassProfileLink(classID: number, profileID: string, link: IClassProfileLink): Cancellable<IClass>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `classlink/` + classID + `/` + profileID,
         data: JSON.stringify(link)
      });
   }

   public deleteClassProfileLinks(classID: number): Cancellable<any>
   {
      return this.request({
         type: "DELETE",
         url: TechboardApi.URL + `classlinks/` + classID
      });
   }

   public getClassesByProfileID(profileID: string): Cancellable<IClass[]>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `classes/` + profileID
      });
   }

   public getProfileListByClass(classID: number): Cancellable<IClassProfileLink[]>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `classlink/` + classID
      });
   }

   /// NOTICE REQUESTS ///

   // Gets a list of all notices
   public getNoticeList(): Cancellable<any>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `notices`
      });
   }

   // gets a single notice record by given id
   public getNoticeById(Id): Cancellable<INotice>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `notice/` + Id
      });
   }

   // creates a new notice record from given notice
   public postNewNotice(notice: INotice): Cancellable<INotice>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `notice`,
         data: JSON.stringify(notice)
      });
   }

   // updates a notice record matching given id using given notice
   public postUpdateNotice(Id, notice: INotice): Cancellable<INotice>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `notice/` + Id,
         data: JSON.stringify(notice)
      });
   }

   // deletes a notice record matching a given id
   public deleteNoticeById(Id): Cancellable<any>
   {
      return this.request({
         type: "DELETE",
         url: TechboardApi.URL + `notice/` + Id
      });
   }

   /// DIPLOMA REQUESTS ///

   // Gets a list of all diplomas that the current logged in user can view
   public getDiplomaList(): Cancellable<any>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `diplomas`
      });
   }

   // gets a single diploma record by given id
   public getDiplomaById(Id): Cancellable<IDiploma>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `diploma/` + Id
      });
   }
   
   // creates a new diploma record from given diploma
   public postNewDiploma(diploma: IDiploma): Cancellable<IDiploma>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `diploma`,
         data: JSON.stringify(diploma)
      });
   }

   // updates a diploma record matching given id using given diploma
   public postUpdateDiploma(Id, diploma: IDiploma): Cancellable<IDiploma>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `diploma/` + Id,
         data: JSON.stringify(diploma)
      });
   }

   // deletes a diploma record matching a given id
   public deleteDiplomaById(Id): Cancellable<any>
   {
      return this.request({
         type: "DELETE",
         url: TechboardApi.URL + `diploma/` + Id
      });
   }

   /// PROFILE REQUESTS ///

   // gets current logged in user profile record
   public getProfile(): Cancellable<IProfile>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `profile`
      });
   }

   public deleteProfileById(id: string): Cancellable<any>
   {
      return this.request({
         type: "DELETE",
         url: TechboardApi.URL + `profile/` + id
      });
   }

   public getProfileById(id: string): Cancellable<IProfile>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `profile/` + id
      });
   }

   public updateProfile(profile: IProfile): Cancellable<IProfile>
   {
      return this.request({
         type: 'POST',
         url: TechboardApi.URL + `profile/update`,
         data: JSON.stringify(profile)
      });
   }

   public updateProfileById(id: string, profile: IProfile): Cancellable<IProfile>
   {
      return this.request({
         type: 'POST',
         url: TechboardApi.URL + `profile/${id}/update`,
         data: JSON.stringify(profile)
      });
   }

   /// RESOURCE REQUESTS ///

   public uploadFile(file: Blob, progress?: (ev: ProgressEvent) => void): Cancellable<IResource> 
   {
      let formData = new FormData();
      formData.append('file', file);
      return this.uploadRequest(TechboardApi.URL + 'resource/uploadNew', formData, progress);
   }

   public getFileURL(fileId: string): string 
   {
      return TechboardApi.URL + `file/${fileId}`;
   }

   /// VERSION LOG REQUESTS ///

   // Gets a list of all version logs
   public getVersionLogList(): Cancellable<any>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `versionlogs`
      });
   }

   // gets a single version log record by given id
   public getVersionLogById(Id): Cancellable<IVersionLog>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `versionlog/` + Id
      });
   }

   // creates a new version log record from given version log
   public postNewVersionLog(versionlog: IVersionLog): Cancellable<IVersionLog>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `versionlog`,
         data: JSON.stringify(versionlog)
      });
   }

   // creates a new version log record from given version log
   public postUpdateVersionLog(Id, versionlog: IVersionLog): Cancellable<IVersionLog>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `versionlog/` + Id,
         data: JSON.stringify(versionlog)
      });
   }

   /// MEMO REQUESTS ///

   // Gets a list of all memos
   public getMemoList(): Cancellable<any>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `memos`
      });
   }

   // Gets a list of all memos
   public getMemoUnseenList(): Cancellable<any>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `memos/unseen`
      });
   }

   // gets a single memo record by given id
   public getMemoById(Id): Cancellable<IMemo>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `memo/` + Id
      });
   }

   // creates a new memo record from given memo
   public postNewMemo(memo: IMemo, userId): Cancellable<IMemo>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `memo/${userId}`,
         data: JSON.stringify(memo)
      });
   }

   public postNewMemos(memo: IMemo, users: string[]): Cancellable<IMemo>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `memos`,
         data: JSON.stringify({ memo: memo, users: users })
      });
   }

   public postSetMemoSeen(Id): Cancellable<any>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `memo/seen/` + Id
      });
   }

   /// SETTING REQUESTS ///

   // Gets a list of all settings
   public getSettingList(): Cancellable<any>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `settings`
      });
   }

   // creates a new setting record from given memo
   public postNewSetting(setting: ISetting): Cancellable<ISetting>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `setting`,
         data: JSON.stringify(setting)
      });
   }

   public updateSetting(setting: ISetting): Cancellable<ISetting>
   {
      return this.request({
         type: 'POST',
         url: TechboardApi.URL + `setting/update`,
         data: JSON.stringify(setting)
      });
   }


   /// CLIENT RESOURCE REQUESTS ///

   // Gets a list of all client resources
   public getClientResourceList(type): Cancellable<any>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `clientresources/` + type
      });
   }

   // gets a single client resource record by given id
   public getClientResourceById(Id): Cancellable<IClientResource>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `clientresource/` + Id
      });
   }

   // creates a new client resource record from given notice
   public postNewClientResource(clientResource: IClientResource): Cancellable<IClientResource>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `clientresource`,
         data: JSON.stringify(clientResource )
      });
   }

   // updates a client resource matching given id using given client resource
   public postUpdateClientResource(Id, clientResource: IClientResource): Cancellable<IClientResource>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `clientresource/` + Id,
         data: JSON.stringify(clientResource)
      });
   }

   // deletes a client resource record matching a given id
   public deleteClientResourceById(Id): Cancellable<any>
   {
      return this.request({
         type: "DELETE",
         url: TechboardApi.URL + `clientresource/` + Id
      });
   }

   /// ASSESSMENT REQUESTS ///

   // Gets a list of all assessment from a given class id
   public getAssessmentListByClassID(classID: number): Cancellable<any>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `assessments/` + classID
      });
   }

   // gets a single assessment record by given id
   public getAssessmentByID(Id): Cancellable<IAssessment>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `assessment/` + Id
      });
   }

   // creates a new assessment record from given assessment
   public postNewAssessment(assessment: IAssessment): Cancellable<IAssessment>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `assessment`,
         data: JSON.stringify(assessment)
      });
   }

   // updates a assessment record matching given id using given assessment
   public postUpdateAssessment(Id, assessment: IAssessment): Cancellable<IAssessment>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `assessment/` + Id,
         data: JSON.stringify(assessment)
      });
   }

   // deletes a assessment record matching a given id
   public deleteAssessmentById(Id): Cancellable<any>
   {
      return this.request({
         type: "DELETE",
         url: TechboardApi.URL + `assessment/` + Id
      });
   }

   /// ASSESSMENT PROFILE LINK REQUESTS ///

   public postAssessmentProfileLink(AssessmentID: number, profileID: string, link: IAssessmentProfileLink): Cancellable<any>
   {
      return this.request({
         type: "POST",
         url: TechboardApi.URL + `assessmentlink/` + AssessmentID + `/` + profileID,
         data: JSON.stringify(link)
      });
   }

   public getAssessmentLinkByID(assessmentID: number, profileId: string): Cancellable<IAssessmentProfileLink>
   {
      return this.request({
         type: "GET",
         url: TechboardApi.URL + `assessmentlink/${assessmentID}/${profileId}`
      });
   }
}