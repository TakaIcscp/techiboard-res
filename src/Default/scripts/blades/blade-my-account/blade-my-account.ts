import { SessionApi } from './../../common/api/session-api';
import { Blade, BladeSize } from '../../components/app-blade/blade';

import * as html from './blade-my-account.html';
import './blade-my-account.css';
import { TechboardApi, IProfile } from '../../common/api/techboard-api';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { ErrorUtils } from '../../common/utils/error-utils';
import { GlobalCommunications } from '../../global-communications';
import { BladeCV } from '../blade-CV/blade-CV';
import { BladeILP } from '../blade-ILP/blade-ILP';
import { BladeRAP } from '../blade-RAP/blade-RAP';
import { BladeRequestChange } from '../blade-request-change/blade-request-change';

export interface IBladeMyAccountParams 
{
}

const FILE_SIZE_LIMIT = 30000000;

const STATE_CV = 'cv';
const STATE_ILP = 'ilp';
const STATE_RAP = 'rap';
const STATE_REQUEST_CHANGE = 'requestchange';

export class BladeMyAccount extends Blade<IBladeMyAccountParams> 
{
   public techboardApi: TechboardApi = new TechboardApi();
   public sessionApi: SessionApi = new SessionApi();

   public isEditing: KnockoutObservable<boolean> = ko.observable(false);
   public isEditing2: KnockoutObservable<boolean> = ko.observable(false);

   public Profile: KnockoutObservable<IProfile> = GlobalCommunications.Profile;
   public studentID: KnockoutObservable<string> = ko.observable(null);
   public profileImage: KnockoutObservable<string> = ko.observable(null);
   public tag: KnockoutObservable<string> = ko.observable(null);
   public mobile: KnockoutObservable<string> = ko.observable(null);
   public gender: KnockoutObservable<string> = ko.observable(null);
   public about: KnockoutObservable<string> = ko.observable(null);
   public position: KnockoutObservable<string> = ko.observable(null);
   public email: KnockoutObservable<string> = ko.observable(null);
   public pass: KnockoutObservable<string> = ko.observable(null);
   public newPass: KnockoutObservable<string> = ko.observable(null);

   public isStudent: KnockoutObservable<boolean> = GlobalCommunications.isStudent;

   constructor() 
   {
      super();

      this.html = html;
      this.title('Your Profile');
      this.size(BladeSize.Big);
      this.canMaximize(false);

      this.Init();

      this.addDisposable(this.Profile.subscribe((profile) => 
      {
         this.Init();
      }));

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

   public async Init(): Promise<void>
   {
      if (this.Profile() != null)
      {
         if (this.Profile().Image != null && this.Profile().Image != "")
         {
            let imagePath = await this.techboardApi.getFileURL(this.Profile().Image);
            this.profileImage(imagePath);
         }

         this.studentID(this.Profile().StudentID);
         this.tag(this.Profile().Tag);
         this.gender(this.Profile().Gender);
         this.about(this.Profile().About);
         this.position(this.Profile().Position);
         this.pass("...");
         this.newPass("")
      }

      this.email($$.Session.User.Email);
      this.mobile($$.Session.User.Mobile);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params: IBladeMyAccountParams) 
   {
      super.refreshBlade(params);
   }

   public getUserName(): string 
   {
      let settings = $$;
      return settings && settings.Session && settings.Session.User ? settings.Session.User.FullName : '';
   }

   public async logout(): Promise<void> 
   {
      await this.sessionApi.logout();

      document.location.reload();
   }

   public imageUpload(): void
   {
      try
      {
         (<any>window).fileDialog({ multiple: false, accept: 'image/*' }, files => {
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
         this.profileImage(file.ID);

         this.Profile().Image = file.ID;
         let update = await this.techboardApi.updateProfile(this.Profile());
         this.Profile(update);
      }
      catch (error)
      {
         console.log(error);
      }
   }

   public toggleEditing(): void
   {
      this.isEditing(!this.isEditing());

      if (!this.isEditing())
      {
         this.tag(this.Profile().Tag);
      }
      this.pass("...");
   }

   public toggleEditing2(): void
   {
      this.isEditing2(!this.isEditing2());
      if (!this.isEditing2())
      {
         this.about(this.Profile().About);
         this.position(this.Profile().Position);
      }
   }

   public async saveTeacherInfo(): Promise<void>
   {
      try
      {
         this.Profile().About = this.about();
         this.Profile().Position = this.position();
         let update = await this.techboardApi.updateProfile(this.Profile());
         this.Profile(update);

         this.isEditing2(false);
         AppMessages.showMessage({ type: MessageType.Success, text: 'Profile successfuly saved.' });
      }
      catch (error)
      {
         console.log(error);
      }
   }

   public async save(): Promise<void>
   {
      if (this.newPass() != this.pass())
      {
         AppMessages.showMessage( {type: MessageType.Error, text: 'Please make sure passwords match.' });
         return;
      }
      try
      {
         let passUpdated = false;

         if (this.pass() != "...") // was changed
         {
            let user = 
            {
               ID: $$.Session.User.ID,
               Password: this.pass()
            }
            await this.sessionApi.updatePassword(user);

            passUpdated = true;
         }

         this.Profile().Tag = this.tag();
         let update = await this.techboardApi.updateProfile(this.Profile());
         this.Profile(update);

         this.isEditing(false);

         if (passUpdated)
         {
            AppMessages.showMessage({ type: MessageType.Success, text: 'Profile successfuly saved.' });
         }
         else
         {
            AppMessages.showMessage({ type: MessageType.Success, text: 'Profile tag successfuly saved.' });
         }
      }
      catch (error)
      {
         console.log(error);
      }
   }

   public async removeProfileImage(): Promise<void>
   {
      try
      {
         this.profileImage(null);
         this.Profile().Image = "";
         let update = await this.techboardApi.updateProfile(this.Profile());
         this.Profile(update);
      }
      catch (error)
      {
         console.log(error);
      }
   }

   public viewCV(): void
   {
      this.updateState(STATE_CV);
   }

   public refreshUrlState(): void 
   {
      super.refreshUrlState();

      let state = this.urlState().next();

      if (state) 
      {
         switch (state) 
         {
            case "cv":
               this.launchBlade(BladeCV);
               this.isMinimized(true);
               break;
            case "ilp":
               this.launchBlade(BladeILP);
               this.isMinimized(true);
               break;
            case "rap":
               this.launchBlade(BladeRAP);
               this.isMinimized(true);
               break;
            case "requestchange":
               this.launchBlade(BladeRequestChange);
               this.isMinimized(true);
               break;
         }
      }
   }

   public viewILP(): void
   {
      this.updateState(STATE_ILP);
   }

   public viewRAP(): void
   {
      this.updateState(STATE_RAP);
   }

   public requestChange(): void
   {
      this.updateState(STATE_REQUEST_CHANGE);
   }
}
