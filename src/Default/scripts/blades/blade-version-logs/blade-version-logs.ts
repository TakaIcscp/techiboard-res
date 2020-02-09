import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-version-logs.html';
import './blade-version-logs.css';
import { TechboardApi, IVersionLog } from '../../common/api/techboard-api';
import { Session } from '../../common/utils/session';
import { GlobalCommunications } from '../../global-communications';
import { BladeVersionLog } from '../blade-version-log/blade-version-log';
import { IFilter } from '../../components/app-complex-search/app-complex-search';

export interface IBladeVersionLogsParams extends IBladePackage 
{

}

const STATE_NEW = 'new';

export class BladeVersionLogs extends Blade<IBladeVersionLogsParams> 
{
   public techApi: TechboardApi = new TechboardApi();
   public data: KnockoutObservable<any[]> = ko.observable([]);
   public selectedLog: KnockoutObservable<IVersionLog> = ko.observable(null);
   public loading: KnockoutObservable<boolean> = ko.observable(false);

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Tiny);
      this.title("Version Log");

      this.addDisposable(
         this.selectedLog.subscribe((value) =>
         {
            this.select(value);
         })
      );
   }

   public async init(): Promise<void>
   {
      this.loading(true);
      try
      {
         let data = await this.techApi.getVersionLogList();
         let dataRecords: any[] = data['Logs'];
         dataRecords.forEach((record) =>
         {
            record.postTitle = '- ' + record.Tag;
         });
         dataRecords.sort((a, b) => a.ID > b.ID ? -1 : 1)
         this.data(dataRecords);
      }
      finally
      {
         this.loading(false);
      }
   }

   public refreshUrlState(): void {
      super.refreshUrlState();

      let state = this.urlState().next();

      if (state) 
      {
         switch (state) 
         {
            case "new":
               this.launchBlade(BladeVersionLog, 
               {
                  logID: ko.observable(null),
                  onsave: (newLog: IVersionLog) => 
                  {
                     this.selectedLog(newLog);
                     this.init();
                  },
                  ondelete: () => 
                  {
                     this.init();
                  }
               });
               break;
            default:
               if (this.selectedLog() != null)
               {
                  this.launchBlade(BladeVersionLog, 
                  {
                     logID: ko.observable(this.selectedLog().ID),
                     onsave: () => 
                     {
                        this.init();
                     },
                     ondelete: () => 
                     {
                        this.selectedLog(null);
                        this.init();
                     }
                  });
               }
               else
               {
                  this.closeBladesFromTheRight();
                  this.selectedLog(null);
               }
               break;
         }
      }
   }

   public select(log: IVersionLog): void
   {
      if (log != null)
      {
         this.updateState(log.ID.toString());
      }
   }  

   public newLog(): void
   {
      this.updateState(STATE_NEW);
      this.selectedLog(null);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeVersionLogsParams) 
   {
      super.refreshBlade(params);

      this.init();
   }

   public isAdmin(): boolean
   {
      return Session.isFeatureEnabled('Admin');
   }
}
