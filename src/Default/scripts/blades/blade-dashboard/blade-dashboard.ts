import { Blade, BladeSize } from '../../components/app-blade/blade';

import * as html from './blade-dashboard.html';
import './blade-dashboard.css';
import { Session } from '../../common/utils/session';
import { IProfile, TechboardApi, IMemo, IUTC, INotice } from '../../common/api/techboard-api';
import { GlobalCommunications } from '../../global-communications';
import { Slide } from '../blade-noticeboard/blade-noticeboard';

export interface IBladeDashboardParams {
}

export class BladeDashboard extends Blade<IBladeDashboardParams> 
{
   public techboardApi: TechboardApi = new TechboardApi();

   public fullName: KnockoutObservable<string> = ko.observable(null);
   public name: KnockoutObservable<string> = ko.observable(null);
   public userType: KnockoutObservable<string> = ko.observable(null);
   public Profile: KnockoutObservable<IProfile> = GlobalCommunications.Profile;
   public profileImage: KnockoutObservable<string> = ko.observable(null);
   public memos: KnockoutObservable<any[]> = ko.observable([]);
   public isMobile: KnockoutObservable<boolean> = ko.observable(false);

   public slides: KnockoutObservable<Slide[]> = ko.observable([]);

   constructor() 
   {
      super();

      this.html = html;

      this.title('Welcome Back');
      this.isMaximized(true);
      this.canMaximize(false);
      this.size(BladeSize.Tiny);

      this.addDisposable(this.Profile.subscribe((profile) => 
      {
         this.Init();
      }));

      let checkShouldBeMobile = (): boolean =>
      {
         if (GlobalCommunications.isMobile())
         {
            return true;
         }
         else if (GlobalCommunications.windowSize() == "small")
         {
            return true;
         }
         return false;
      }

      this.addDisposable(GlobalCommunications.isMobile.subscribe(() =>
      {
         this.isMobile(checkShouldBeMobile());
      }));
      this.addDisposable(GlobalCommunications.windowSize.subscribe(() =>
      {
         this.isMobile(checkShouldBeMobile());
      }));
      this.isMobile(checkShouldBeMobile());

      this.LoadSlide();
   }

   // loads slides for dashboard slideshow
   public async LoadSlide(): Promise<void>
   {
      try
      {
         let data = await this.techboardApi.getNoticeList();
         let notices: INotice[] = data['Notices'];
         let slides: Slide[] = [];

         for (let i = 0; i < notices.length; i++)
         {
            let notice = notices[i];

            let newSlide: Slide = {};

            if (notice.Image != null)
            {
               newSlide.path = await this.techboardApi.getFileURL(notice.Image);
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

   public async refreshBlade(params: IBladeDashboardParams) 
   {
      super.refreshBlade(params);

      this.Init();
      this.fullName($$.Session.User.FullName);

      // depending on logged in user display different levels of permission access
      if ($$.Session.AccessPermissions.UserGroups.some(x => x === "Admin"))
      {
         this.userType('Admin');
      }
      else if ($$.Session.AccessPermissions.UserGroups.some(x => x === "Teachers"))
      {
         this.userType('Teacher');
      }
      else
      {
         this.userType('Student');
      }
   }

   public async Init(): Promise<void>
   {
      if (this.Profile() != null && this.Profile().Tag != null && this.Profile().Tag != "")
      {
         this.name(this.Profile().Tag);
      }
      else
      {
         if ($$.Session.User.FullName != null)
         {
            this.name($$.Session.User.FullName.split(" ")[0]);
         }
         else
         {
            this.name($$.Session.User.ID);
         }
      }

      if (this.Profile() != null && this.Profile().Image != null && this.Profile().Image != "")
      {
         let imagePath = await this.techboardApi.getFileURL(this.Profile().Image);
         this.profileImage(imagePath);
      }

      this.title('Welcome back ' + this.name());

      let data = await this.techboardApi.getMemoUnseenList();
      let memos: any[] = data['Memos'];

      // taken from some place, probably should remake it myself later
      let formatDate = (date) =>
      {
         let hours = date.getHours();
         let minutes = date.getMinutes();
         let ampm = hours >= 12 ? 'pm' : 'am';
         hours = hours % 12;
         hours = hours ? hours : 12; // the hour '0' should be '12'
         minutes = minutes < 10 ? '0'+minutes : minutes;
         let strTime = hours + ':' + minutes + ' ' + ampm;
         return date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear() + " " + strTime;
      }

      memos.forEach(memo => 
      {
         memo.postText = 'From: ' + memo.CreatedByUserID + ' ';

         let recUTC: IUTC = memo.SentTime;
         let date = new Date(recUTC.y, recUTC.m - 1, recUTC.d, recUTC.hh, recUTC.mm, recUTC.ss, 0);
         date.setHours(date.getHours() + 13);
         memo.title= 'Received: ' + formatDate(date) + ' ';
      });

      this.memos(data['Memos']);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public goToMemos(): void
   {
      GlobalCommunications._shellInstance.switchToMemos();
   }
}
