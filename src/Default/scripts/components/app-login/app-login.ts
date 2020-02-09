import { AbstractComponent, IAbstractComponentParams, Component } from '../../common/decorator/component';
import { ErrorUtils } from '../../common/utils/error-utils';
import { SessionApi, IUser } from '../../common/api/session-api';

import * as html from './app-login.html';
import './app-login.css';

export interface IAppLoginParams extends IAbstractComponentParams 
{
}

@Component({ name: 'app-login', template: html })
export class AppLogin extends AbstractComponent<IAppLoginParams> 
{
   public login: KnockoutObservable<string> = ko.observable('');
   public password: KnockoutObservable<string> = ko.observable('');
   public agree: KnockoutObservable<boolean> = ko.observable(true); //change to false later when you add terms and conditions
   public error: KnockoutObservable<string> = ko.observable('');

   public api: SessionApi = new SessionApi();

   public eventHandler;

   constructor(params: IAppLoginParams) 
   {
      super(params);


      let This = this;
      this.eventHandler = window.addEventListener("keyup", function(event) 
      {
         if (event.keyCode === 13) // 13 is keycode for enter
         {
            This.authUser();
         }
      });
   }

   public dispose(): void
    {
      super.dispose();

      window.removeEventListener("keyup", this.eventHandler);
   }

   public async authUser(): Promise<void> 
   {
      if (!this.agree()) {
         this.error('Before you enter this site, we need you to accept the Terms and Conditions of its use (the tick-box above).');
         return;
      }

      if (!this.login() || !this.password()) 
      {
         this.error('Please fill login and password fields.');
         return;
      }

      try
      {
         this.error('');

         // === Do the Logout before we do Login.

         try
         {
            await this.api.logout();
         } catch (e1) {}

         // === Do the Login via IDM.

         let reply = await this.api.login(this.login(), this.password());

         // === Check if we have Admin priviliedge set up for the User.

         let user = reply.Session.User as IUser;

         let isAdmin = false;

         if (user!=null && user.AccessPermissions!=null) user.AccessPermissions.forEach(grant =>
         {
            if (grant["ClientAccount.ID"]==$$.ClientAccount.ID)
            {
               grant.UserGroups.forEach(group =>
               {
                  group.Features.forEach(feature => 
                  {
                     if (feature == "Admin")
                     {
                        isAdmin = true;
                     }
                  });
               });
            }
         });

         // === If the User is NOT Admin - Log out and say the error.

         /*
         if (!isAdmin)
         {
            try {await this.api.logout();} catch (e1) {}
            throw "Accessing this UI requires Administrative Access Permission, which you don't have. Please contact your Administrator to request this access.";
         }
         */

         // === Reload the Document at its current location.

      document.location.reload();
      } catch (error) 
      {
         this.error(ErrorUtils.getMessage(error));
      }
   }

   public getBackground(): string
   {
      return 'url("' + $$.Root + "Default/media/bg2.jpg" + '")';
   }

   public getLogo(): string
   {
      return $$.Root + '/Default/media/techtorium-logo-banner.png';
   }
}
