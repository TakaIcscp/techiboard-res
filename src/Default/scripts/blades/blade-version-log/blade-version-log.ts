import { Blade, BladeSize } from '../../components/app-blade/blade';

import * as html from './blade-version-log.html';
import './blade-version-log.css';
import { TechboardApi, IVersionLog } from '../../common/api/techboard-api';
import { IBladePackage } from '../../components/app-blades/app-blades';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { ErrorUtils } from '../../common/utils/error-utils';

export interface IBladeVersionLogParams extends IBladePackage
{
   logID?: KnockoutObservable<number>;

   onsave?: (clas: IVersionLog) => void;
   ondelete?: () => void;
}

interface Content
{
   text: KnockoutObservable<string>;
}

export class BladeVersionLog extends Blade<IBladeVersionLogParams> 
{
   public techboardApi: TechboardApi = new TechboardApi();

   public ID: KnockoutObservable<number> = ko.observable(null);
   public CreatedByUserID: KnockoutObservable<string> = ko.observable(null);
   public Version: KnockoutObservable<string> = ko.observable(null);
   public Tag: KnockoutObservable<string> = ko.observable(null);

   public ContentsList: KnockoutObservable<Content[]> = ko.observable([]);

   public isLoading: KnockoutObservable<boolean> = ko.observable(false);
   public editing: KnockoutObservable<boolean> = ko.observable(false);

   private _onsave?: (clas: IVersionLog) => void;
   private _ondelete?: () => void;

   public canEdit: KnockoutObservable<boolean> = ko.observable(false);

   constructor() 
   {
      super();

      this.html = html;
      this.title('Version Log');
      this.size(BladeSize.Medium);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params: IBladeVersionLogParams) 
   {
      super.refreshBlade(params);

      if (params.logID != null)
      {
         this.ID = params.logID;
      }

      this._onsave = params.onsave;
      this._ondelete = params.ondelete;

      this.init();
   }
   
   public async init(): Promise<void>
   {
      this.isLoading(true);

      try
      {
         if (this.ID() == null)
         {
            this.title("New Log");

            this.CreatedByUserID(null);
            this.Version(null);
            this.Tag(null);
         
            this.ContentsList([]);

            this.editing(true);
         }
         else
         {
            this.editing(false);

            let logRecord = await this.techboardApi.getVersionLogById(this.ID());

            this.title("[" + logRecord.Version + "] " + logRecord.Tag);

            this.CreatedByUserID(logRecord.CreatedByUserID);
            this.Version(logRecord.Version);
            this.Tag(logRecord.Tag);
         
            this.ContentsList([]);
   
            if (logRecord.Contents != null)
            {
   
               let contents: string[] = JSON.parse(logRecord.Contents);
               this.ContentsList((contents).map(x => {
                  return {
                     text: ko.observable(x)
                  };
               }));
            }
            else
            {
               this.ContentsList([]);
            }
         }
      }
      finally
      {
         this.isLoading(false);

         if ($$.Session.AccessPermissions.EnabledFeatures.some(x => x === "Admin"))
         {
            this.canEdit(true);
         }
      }
   }

   
   public async save(): Promise<void>
   {
      try 
      {
         this.isLoading(true);
   
         let log: IVersionLog = 
         {
            ID: this.ID(),
            Tag: this.Tag(),
            Version: this.Version(),
            Contents: JSON.stringify(this.ContentsList().map(x => x.text()))
         };
         
         if (log.ID == null)
         {
            log = await this.techboardApi.postNewVersionLog(log);
         }
         else
         {
            log = await this.techboardApi.postUpdateVersionLog(log.ID, log);
         }

         AppMessages.showMessage({ type: MessageType.Success, text: 'Log successfully saved' });
         if (this._onsave) 
         {
            this._onsave(log);
         }

         this.editing(false);
      } 
      catch (error) 
      {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });
      } 
      finally 
      {
         this.isLoading(false);
      }

      this.init();
   }

   public removeContent(content: Content): void 
   {
      let contents = this.ContentsList().filter(x => x !== content);
      this.ContentsList(contents);
   }
   
   public add(): void 
   {
      let contents = this.ContentsList();
      contents.push({ text: ko.observable('') });
      this.ContentsList(contents);
   }

   public async toggleEdit(): Promise<void>
   {
      this.editing(!this.editing());

      if (!this.editing())
      {
         this.init();
      }

      if (this.ID() == null)
      {
         this.close();
      }
   }
}
