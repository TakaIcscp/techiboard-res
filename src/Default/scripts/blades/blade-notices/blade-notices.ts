import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-notices.html';
import './blade-notices.css';
import { TechboardApi, INotice } from '../../common/api/techboard-api';
import { BladeNotice } from '../blade-notice/blade-notice';

export interface IBladeNoticesParams extends IBladePackage 
{

}

const STATE_NEW = 'new';

// represents all notices created
export class BladeNotices extends Blade<IBladeNoticesParams> 
{
   public techApi: TechboardApi = new TechboardApi();
   public data: KnockoutObservable<any[]> = ko.observable([]);
   public selectedNotice: KnockoutObservable<INotice> = ko.observable(null);
   public loading: KnockoutObservable<boolean> = ko.observable(false);

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Small);
      this.title("Notices");

      this.addDisposable(this.selectedNotice.subscribe((value) =>
      {
         this.select(value);
      }));
   }

   public async init(): Promise<void>
   {
      this.loading(true);
      try
      {
         let data = await this.techApi.getNoticeList();
         let notices: any[] = data['Notices'];

         notices.forEach((notice) =>
         {
            notice.preTitle = 'Notice By: ';
         });

         this.data(notices);

         if (this.selectedNotice() == null)
         {
            let state = this.currentState;
            let selectedNotice = this.data().find(x => x.ID.toString() == state);
            this.selectedNotice(selectedNotice)
         }
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
                  this.launchBlade(BladeNotice, {
                     onsave: (newNotice: INotice) => {
                        this.selectedNotice(newNotice);
                        this.init();
                     },
                     ondelete: () => {
                        this.init();
                     }
                  });
                  break;
            default:
                  if (this.selectedNotice() == null)
                  {
                     this.closeBladesFromTheRight();
                     this.selectedNotice(null);
                     return;
                  }

                  this.launchBlade(BladeNotice, 
                  {
                     notice: this.selectedNotice,
                     onsave: () => 
                     {
                        this.init();
                     },
                     ondelete: () => 
                     {
                        this.selectedNotice(null);
                        this.init();
                     }
                  });
               break;
         }
      }
   }

   public select(notice: INotice): void
   {
      if (notice != null)
      {
         this.updateState(notice.ID.toString());
      }
   }  

   public newNotice(): void
   {
      this.updateState(STATE_NEW);
      this.selectedNotice(null);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeNoticesParams) 
   {
      super.refreshBlade(params);

      this.init();
   }
}
