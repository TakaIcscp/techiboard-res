import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-staff-member.html';
import './blade-staff-member.css';
import { SessionApi } from '../../common/api/session-api';
import { TechboardApi } from '../../common/api/techboard-api';

export interface IBladeStaffMemberParams extends IBladePackage 
{
   ID: string
}

// represents a single staff member public profile
export class BladeStaffMember extends Blade<IBladeStaffMemberParams> 
{
   public sessionApi: SessionApi = new SessionApi();
   public techboardApi: TechboardApi = new TechboardApi();

   public ID: KnockoutObservable<string> = ko.observable(null);
   public isLoading: KnockoutObservable<boolean> = ko.observable(false);

   public profileImage: KnockoutObservable<string> = ko.observable(null);
   public email: KnockoutObservable<string> = ko.observable(null);
   public phoneNumber: KnockoutObservable<string> = ko.observable(null);
   public position: KnockoutObservable<string> = ko.observable(null);
   public about: KnockoutObservable<string> = ko.observable(null);

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Small);
      this.title("Member");
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeStaffMemberParams) 
   {
      super.refreshBlade(params);

      this.ID(params.ID);

      this.Init();
   }

   public async Init(): Promise<void>
   {
      this.isLoading(true);
      try
      {
         let profile = await this.techboardApi.getProfileById(this.ID());
         let IDMProfile = await this.sessionApi.getUserById(this.ID());

         this.title(IDMProfile.FullName);
         this.email(IDMProfile.Email);
         this.phoneNumber(IDMProfile.Mobile);
         this.position(profile.Position);
         this.about(profile.About);

         if (profile.Image != null && profile.Image != "")
         { 
            let imagePath = null;
            try
            {
               imagePath = await this.techboardApi.getFileURL(profile.Image);
            }
            finally
            {
               this.profileImage(imagePath == null || imagePath == "" ? null : imagePath);
            }
         }
         else
         {
            this.profileImage(null);
         }
      }
      finally
      {
         this.isLoading(false);
      }
   }
}
