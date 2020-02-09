import { Blade, BladeSize } from '../../components/app-blade/blade';

import * as html from './blade-support.html';
import './blade-support.css';
import { TechboardApi, IMemo } from '../../common/api/techboard-api';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { GlobalCommunications } from '../../global-communications';

export interface IBladeSupportParams 
{
}

const FILE_SIZE_LIMIT = 20000000;

export class BladeSupport extends Blade<IBladeSupportParams> 
{
   public techboardApi: TechboardApi = new TechboardApi();

   public Text: KnockoutObservable<string> = ko.observable(null);
   public Image: KnockoutObservable<string> = ko.observable(null);
   
   constructor() 
   {
      super();

      this.html = html;
      this.title('Site Support');
      this.size(BladeSize.Medium);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params: IBladeSupportParams) 
   {
      super.refreshBlade(params);
   }

   public async send(): Promise<void>
   {
      if (this.Text() == "" || this.Text() == null)
      {
         AppMessages.showMessage({ type: MessageType.Error, text: 'Your message cannot be empty.' });
         return;
      }

      let memo: IMemo = {};
      memo.Text = this.Text();
      memo.Attachments = [this.Image()];

      // temporary, currently all support and report memos go to taka
      await this.techboardApi.postNewMemo(memo, "taka");

      AppMessages.showMessage({ type: MessageType.Success, text: 'A memo was sent regarding your interest' });
      this.close();
   }

   public getVGLogo(): string
   {
      return GlobalCommunications.getLocalFilePath('vg-logo.png');
   }

   public imageUpload(): void
   {
      try
      {
         (<any>window).fileDialog({ multiple: false, accept: 'image/*' }, files => 
         {
            // make sure uploaded file stays under file limit
            if (files[0]['size'] > FILE_SIZE_LIMIT)
            {
               AppMessages.showMessage({ type: MessageType.Error, text: 'The file limit is 20MB.' });
            }
            else
            {
               this.importImage(files);
            }
         });
      }
      catch (error)
      {
         console.log(error);
      }
   }

   public async importImage(files: any): Promise<void>
   {
      try
      {
         let file = await this.techboardApi.uploadFile(files[0]);
         this.Image(file.ID);
      }
      catch (error)
      {
         console.log(error);
      }
   }

   public removeImage(): void
   {
      this.Image(null);
   }
}
