import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-memos.html';
import './blade-memos.css';
import { TechboardApi, IUTC, IMemo } from '../../common/api/techboard-api';
import { Session } from '../../common/utils/session';
import { BladeMemo } from '../blade-memo/blade-memo';
import { IFilterControl, IFilter } from '../../components/app-complex-search/app-complex-search';
import { GlobalCommunications } from '../../global-communications';
import { BladeMultiMemo } from '../blade-multi-memo/blade-multi-memo';

export interface IBladeMemosParams extends IBladePackage 
{

}

const STATE_NEW = 'new';

const STATE_MULTI_NEW = 'multi';

// represents all available to view memos for the current logged in user
export class BladeMemos extends Blade<IBladeMemosParams> 
{
   public techApi: TechboardApi = new TechboardApi();
   public data: KnockoutObservable<any[]> = ko.observable([]);
   public selectedMemo: KnockoutObservable<IMemo> = ko.observable(null);
   public loading: KnockoutObservable<boolean> = ko.observable(false);

   // filters to alter what memos are currently visible
   public filters: KnockoutObservable<IFilter[]> = ko.observable
   ([
      { title: 'Hide From You', desiredValue: $$.Session.User.ID, variableId: 'CreatedByUserID', checked: true },
      { title: 'Hide Seen (To You)', desiredValue: false, variableId: 'Seen1', checked: true, not: true }
   ]);

   public isTeacher: KnockoutObservable<boolean> = GlobalCommunications.isTeacher;
   public isAdmin: KnockoutObservable<boolean> = GlobalCommunications.isAdmin;

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Small);
      this.title("Memos");

      this.addDisposable(this.selectedMemo.subscribe((value) =>
      {
         this.select(value);
      }));
   }

   public async init(): Promise<void>
   {
      this.loading(true);
      try
      {
         let data = await this.techApi.getMemoList();

         let memos: any[] = data['Memos'];
         memos.forEach((memo) =>
         {
            if (memo.CreatedByUserID == $$.Session.User.ID)
            {
               memo.preTitle = 'From: You ';

               if (memo.ForUserID == $$.Session.User.ID)
               {
                  memo.Seen1 = memo.Seen != null ? memo.Seen : false;
                  memo.postTitle = ' To: You';
               }
               else
               {
                  memo.Seen1 = false;
                  memo.postTitle = ' To: ' + memo.ForUserID;                  
               }
            }
            else
            {
               memo.preTitle = 'From: ' + memo.CreatedByUserID + ' ';
               memo.postTitle = ' To: You';
               memo.Seen1 = memo.Seen != null ? memo.Seen : false;
            }
         });
         memos.sort((a, b) => a.ID > b.ID ? -1 : 1);

         this.data(memos);
      }
      finally
      {
         this.loading(false);
      }
   }

   public refreshUrlState(): void 
   {
      super.refreshUrlState();

      let state = this.urlState().next();

      if (state) 
      {
         switch (state) 
         {
            case "new":
               this.launchBlade(BladeMemo, 
               {
                  onsave: () =>
                  {
                     this.selectedMemo(null);
                     this.init();
                  }
               });
               break;
            case "multi":
               this.launchBlade(BladeMultiMemo,
               {
                 onsave: () =>
                 {
                    this.selectedMemo(null);
                    this.init();
                 } 
               })
               break;
            default:
               if (this.selectedMemo() == null)
               {
                  this.closeBladesFromTheRight();
                  this.selectedMemo(null);
                  return;
               }
               
               this.launchBlade(BladeMemo, 
               {
                  memo: this.selectedMemo
               });
               break;
         }
      }
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeMemosParams) 
   {
      super.refreshBlade(params);

      this.init();
   }

   public select(memo: any): void
   {
      if (memo != null)
      {
         this.updateState(memo.ID.toString());
      }
   }  

   public newMemo(): void
   {
      this.updateState(STATE_NEW);
      this.selectedMemo(null);
   }

   public newMemos(): void
   {
      this.updateState(STATE_MULTI_NEW);
      this.selectedMemo(null);
   }
}
