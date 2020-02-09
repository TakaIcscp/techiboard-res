import { Blade, BladeSize } from '../../components/app-blade/blade';

import * as html from './blade-memo.html';
import './blade-memo.css';
import { TechboardApi, IMemo, IUTC } from '../../common/api/techboard-api';
import { IBladePackage } from '../../components/app-blades/app-blades';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';

export interface IBladeMemoParams extends IBladePackage 
{
   memo?: KnockoutObservable<IMemo>;
   onsave?: () => void;
}

// represents a single memo record to either view or create
export class BladeMemo extends Blade<IBladeMemoParams> 
{
   public techboardApi: TechboardApi = new TechboardApi();

   public memo: KnockoutObservable<IMemo> = ko.observable(null);
   public sendDateFormatted: KnockoutObservable<string> = ko.observable(null);

   public Text: KnockoutObservable<string> = ko.observable(null);
   public Image: KnockoutObservable<string> = ko.observable(null);
   public imagePath: KnockoutObservable<string> = ko.observable(null);
   public Seen: KnockoutObservable<boolean> = ko.observable(false);

   public selectedUser: KnockoutObservable<any> = ko.observable(null);
   public users: KnockoutObservable<any[]> = ko.observable([]);

   private onsave?: () => void;

   constructor() 
   {
      super();

      this.html = html;
      this.title('Memo');
      this.size(BladeSize.Tiny);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params: IBladeMemoParams) 
   {
      super.refreshBlade(params);

      this.onsave = params.onsave;

      if (params.memo != null)
      {
         this.memo(params.memo());
         this.Seen(params.memo().Seen != null ? params.memo().Seen : false);

         if (params.memo().Attachments != null && params.memo().Attachments.length > 0)
         {
            //@ts-ignore
            let p = params.memo().Attachments.substring(1, params.memo().Attachments.length - 1);
            let path = await this.techboardApi.getFileURL(p);
            this.imagePath(path);
         }
         else
         {
            this.imagePath(null);
         }
         this.Image(params.memo().Attachments != null && params.memo().Attachments.length > 1 ? params.memo().Attachments[0] : null);

         if (params.memo().SentTime)
         {
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

            let recUTC: IUTC = params.memo().SentTime;
            let date = new Date(recUTC.y, recUTC.m - 1, recUTC.d, recUTC.hh, recUTC.mm, recUTC.ss, 0);
            date.setHours(date.getHours() + 13);
            this.sendDateFormatted(formatDate(date));
         }

         if (this.memo().Seen != true)
         {
            await this.techboardApi.postSetMemoSeen(this.memo().ID);
         }
      }
      else
      {
         this.selectedUser('');
         this.Text('');
         this.memo(null);
         this.sendDateFormatted(null);
         this.Seen(false);
         this.Image(null);
         this.imagePath(null);

         let usersList = await this.techboardApi.getUsersByGroup("Webusers");

         let newList = [];
         for (let key in usersList)
         {
            newList.push
            (
               {
                  id: key,
                  name: key,
                  postText: usersList[key].FullName != null ? " - " + usersList[key].FullName : ''
               }
            );
         }

         this.users(newList);
      }
   }

   public init(): void
   {
      
   }

   public async send(): Promise<void>
   {
      if (this.Text() == "" || this.Text() == null)
      {
         AppMessages.showMessage({ type: MessageType.Error, text: 'Your message cannot be empty.' });
         return;
      }

      if (this.selectedUser() == "" || this.selectedUser() == null)
      {
         AppMessages.showMessage({ type: MessageType.Error, text: 'Please select who to send the message to.' });
         return;
      }

      if (this.memo() == "")
      {
         alert("Please enter a response!")
      }

      let memo: IMemo = {};
      memo.Text = this.Text();
      memo.Seen = false;

      await this.techboardApi.postNewMemo(memo, this.selectedUser().id);

      AppMessages.showMessage({ type: MessageType.Success, text: 'The memo was sent...' });

      if (this.onsave != null)
      {
         this.onsave();
      }
      this.close();
   }

   public canReply(): boolean
   {
      return $$.Session.User.ID != this.memo().CreatedByUserID;
   }

   public reply(): void
   {
      this.selectedUser(this.memo().CreatedByUserID);
      this.memo(null);
      this.Text('');
      this.memo(null);
      this.sendDateFormatted(null);
      this.Seen(false);
      this.Image(null);
      this.imagePath(null);
   }
}