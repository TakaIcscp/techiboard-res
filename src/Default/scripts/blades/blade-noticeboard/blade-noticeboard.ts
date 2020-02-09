import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-noticeboard.html';
import './blade-noticeboard.css';
import { BladeNotices } from '../blade-notices/blade-notices';
import { TechboardApi, INotice } from '../../common/api/techboard-api';
import { Session } from '../../common/utils/session';

export interface IBladeNoticeboardParams extends IBladePackage 
{

}

const STATE_NOTICES = 'notices';

export interface Slide
{
   path?: string;
   backgroundColor?: string;
   text?: string;
   textColor?: string;
   subtext?: string;
   subtextColor?: string;
}

// represents the combination of a pause button and the slideshow component to show all available notices
export class BladeNoticeboard extends Blade<IBladeNoticeboardParams> 
{
   public techApi: TechboardApi = new TechboardApi();

   public slides: KnockoutObservable<Slide[]> = ko.observable([]);
   public paused: KnockoutObservable<boolean> = ko.observable(false);

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Tiny);
      this.title("Noticeboard");

      this.isMaximized(true);
      this.canMaximize(false);

      this.addDisposable (
         this.isMinimized.subscribe((value) => 
         {
            if (!value)
            {
               this.closeBladesFromTheRight();
            }
         })
      )
   }

   // get all notices and format to fit slideshow details
   public async Init(): Promise<void>
   {
      try
      {
         let data = await this.techApi.getNoticeList();
         let notices: INotice[] = data['Notices'];
         let slides: Slide[] = [];

         for (let i = 0; i < notices.length; i++)
         {
            let notice = notices[i];

            let newSlide: Slide = {};

            if (notice.Image != null)
            {
               newSlide.path = await this.techApi.getFileURL(notice.Image);
            }
            newSlide.text = notice.Text;
            newSlide.subtext = notice.SubText;

            if (notice.Styling)
            {
               let styling = JSON.parse(notice.Styling);

               newSlide.backgroundColor = styling['BackgroundColor'];
               newSlide.textColor = styling['TextColor'];
               newSlide.subtextColor = styling['SubtextColor'];

               slides.push(newSlide);
            }
         }
         this.slides(slides);
      }
      finally
      {

      }
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeNoticeboardParams) 
   {
      super.refreshBlade(params);

      this.Init();
   }

   public refreshUrlState(): void {
      super.refreshUrlState();

      let state = this.urlState().next();

      if (state) 
      {
         switch (state) 
         {
            case "notices":
               this.launchBlade(BladeNotices);
               this.isMinimized(true);
               break;
         }
      }
   }

   public viewNotices(): void
   {
      this.updateState(STATE_NOTICES);
   }

   public togglePause(): void
   {
      this.paused(!this.paused());
   }

   public isAdmin(): boolean
   {
      return Session.isFeatureEnabled('Admin');
   }
}
