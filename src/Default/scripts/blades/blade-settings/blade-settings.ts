import { Blade, BladeSize } from '../../components/app-blade/blade';

import * as html from './blade-settings.html';
import './blade-settings.css';
import { TechboardApi, ISetting } from '../../common/api/techboard-api';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { ErrorUtils } from '../../common/utils/error-utils';
import { GlobalCommunications } from '../../global-communications';

export interface IBladeSettingsParams 
{
}

// a preset represents all changed that will be run to restyle the dashboard
export interface Preset
{
   id: string;
   bladecolor?: string;
   bladebordercolor?: string;
   bladeclosedcolor?: string;
   leftbarcolor?: string;
   topbarcolor?: string;
   background?: string;
   leftbarcategorycolor?: string;
   leftbarbuttoncolor?: string;
   leftbarbuttontextcolor?: string;
   leftbarcategorytextcolor?: string;
}

export class BladeSettings extends Blade<IBladeSettingsParams> 
{
   // presets available to pick from and their effect
   public static presets: Preset[] = 
   [
      {
         id: "default"
      },
      {
         id: "dark",
         leftbarcolor: "#3d3d3d",
         topbarcolor: "#3d3d3d",
         background: "linear-gradient(161deg, rgba(121, 121, 121, 0.02) 0%, rgba(121, 121, 121, 0.02) 16.667%,rgba(193, 193, 193, 0.02) 16.667%, rgba(193, 193, 193, 0.02) 33.334%,rgba(177, 177, 177, 0.02) 33.334%, rgba(177, 177, 177, 0.02) 50.001000000000005%,rgba(5, 5, 5, 0.02) 50.001%, rgba(5, 5, 5, 0.02) 66.668%,rgba(229, 229, 229, 0.02) 66.668%, rgba(229, 229, 229, 0.02) 83.33500000000001%,rgba(211, 211, 211, 0.02) 83.335%, rgba(211, 211, 211, 0.02) 100.002%),linear-gradient(45deg, rgba(223, 223, 223, 0.02) 0%, rgba(223, 223, 223, 0.02) 14.286%,rgba(70, 70, 70, 0.02) 14.286%, rgba(70, 70, 70, 0.02) 28.572%,rgba(109, 109, 109, 0.02) 28.572%, rgba(109, 109, 109, 0.02) 42.858%,rgba(19, 19, 19, 0.02) 42.858%, rgba(19, 19, 19, 0.02) 57.144%,rgba(180, 180, 180, 0.02) 57.144%, rgba(180, 180, 180, 0.02) 71.42999999999999%,rgba(63, 63, 63, 0.02) 71.43%, rgba(63, 63, 63, 0.02) 85.71600000000001%,rgba(87, 87, 87, 0.02) 85.716%, rgba(87, 87, 87, 0.02) 100.002%),linear-gradient(337deg, rgba(142, 142, 142, 0.02) 0%, rgba(142, 142, 142, 0.02) 20%,rgba(164, 164, 164, 0.02) 20%, rgba(164, 164, 164, 0.02) 40%,rgba(203, 203, 203, 0.02) 40%, rgba(203, 203, 203, 0.02) 60%,rgba(228, 228, 228, 0.02) 60%, rgba(228, 228, 228, 0.02) 80%,rgba(54, 54, 54, 0.02) 80%, rgba(54, 54, 54, 0.02) 100%),linear-gradient(314deg, rgba(187, 187, 187, 0.02) 0%, rgba(187, 187, 187, 0.02) 12.5%,rgba(170, 170, 170, 0.02) 12.5%, rgba(170, 170, 170, 0.02) 25%,rgba(214, 214, 214, 0.02) 25%, rgba(214, 214, 214, 0.02) 37.5%,rgba(187, 187, 187, 0.02) 37.5%, rgba(187, 187, 187, 0.02) 50%,rgba(190, 190, 190, 0.02) 50%, rgba(190, 190, 190, 0.02) 62.5%,rgba(6, 6, 6, 0.02) 62.5%, rgba(6, 6, 6, 0.02) 75%,rgba(206, 206, 206, 0.02) 75%, rgba(206, 206, 206, 0.02) 87.5%,rgba(171, 171, 171, 0.02) 87.5%, rgba(171, 171, 171, 0.02) 100%),linear-gradient(300deg, rgba(243, 243, 243, 0.01) 0%, rgba(243, 243, 243, 0.01) 12.5%,rgba(209, 209, 209, 0.01) 12.5%, rgba(209, 209, 209, 0.01) 25%,rgba(179, 179, 179, 0.01) 25%, rgba(179, 179, 179, 0.01) 37.5%,rgba(3, 3, 3, 0.01) 37.5%, rgba(3, 3, 3, 0.01) 50%,rgba(211, 211, 211, 0.01) 50%, rgba(211, 211, 211, 0.01) 62.5%,rgba(151, 151, 151, 0.01) 62.5%, rgba(151, 151, 151, 0.01) 75%,rgba(16, 16, 16, 0.01) 75%, rgba(16, 16, 16, 0.01) 87.5%,rgba(242, 242, 242, 0.01) 87.5%, rgba(242, 242, 242, 0.01) 100%),linear-gradient(6deg, rgba(31, 31, 31, 0.02) 0%, rgba(31, 31, 31, 0.02) 20%,rgba(193, 193, 193, 0.02) 20%, rgba(193, 193, 193, 0.02) 40%,rgba(139, 139, 139, 0.02) 40%, rgba(139, 139, 139, 0.02) 60%,rgba(14, 14, 14, 0.02) 60%, rgba(14, 14, 14, 0.02) 80%,rgba(122, 122, 122, 0.02) 80%, rgba(122, 122, 122, 0.02) 100%),linear-gradient(279deg, rgba(190, 190, 190, 0.02) 0%, rgba(190, 190, 190, 0.02) 14.286%,rgba(160, 160, 160, 0.02) 14.286%, rgba(160, 160, 160, 0.02) 28.572%,rgba(23, 23, 23, 0.02) 28.572%, rgba(23, 23, 23, 0.02) 42.858%,rgba(60, 60, 60, 0.02) 42.858%, rgba(60, 60, 60, 0.02) 57.144%,rgba(149, 149, 149, 0.02) 57.144%, rgba(149, 149, 149, 0.02) 71.42999999999999%,rgba(4, 4, 4, 0.02) 71.43%, rgba(4, 4, 4, 0.02) 85.71600000000001%,rgba(50, 50, 50, 0.02) 85.716%, rgba(50, 50, 50, 0.02) 100.002%),linear-gradient(109deg, rgba(124, 124, 124, 0.03) 0%, rgba(124, 124, 124, 0.03) 12.5%,rgba(61, 61, 61, 0.03) 12.5%, rgba(61, 61, 61, 0.03) 25%,rgba(187, 187, 187, 0.03) 25%, rgba(187, 187, 187, 0.03) 37.5%,rgba(207, 207, 207, 0.03) 37.5%, rgba(207, 207, 207, 0.03) 50%,rgba(206, 206, 206, 0.03) 50%, rgba(206, 206, 206, 0.03) 62.5%,rgba(118, 118, 118, 0.03) 62.5%, rgba(118, 118, 118, 0.03) 75%,rgba(89, 89, 89, 0.03) 75%, rgba(89, 89, 89, 0.03) 87.5%,rgba(96, 96, 96, 0.03) 87.5%, rgba(96, 96, 96, 0.03) 100%),linear-gradient(329deg, rgba(35, 35, 35, 0.02) 0%, rgba(35, 35, 35, 0.02) 20%,rgba(246, 246, 246, 0.02) 20%, rgba(246, 246, 246, 0.02) 40%,rgba(118, 118, 118, 0.02) 40%, rgba(118, 118, 118, 0.02) 60%,rgba(245, 245, 245, 0.02) 60%, rgba(245, 245, 245, 0.02) 80%,rgba(140, 140, 140, 0.02) 80%, rgba(140, 140, 140, 0.02) 100%),linear-gradient(90deg, hsl(314,0%,31%),hsl(314,0%,31%))"
      }
   ];

   public techboardApi: TechboardApi = new TechboardApi();

   public autoCollapse: KnockoutObservable<boolean> = ko.observable(true);
   public loading: KnockoutObservable<boolean> = ko.observable(false);
   public presets: KnockoutObservable<string[]> = ko.observable(["default", "dark"]);
   public selectedPreset: KnockoutObservable<string> = ko.observable("default");

   constructor() 
   {
      super();

      this.html = html;
      this.title('Settings');
      this.size(BladeSize.Small);

      return;

      // preset testing //

      let BLADE_COLOR = "rgba(230, 245, 66, 0.4)";
      let BLADE_BORDER_COLOR = "blue";
      let BLADE_CLOSED_COLOR = "black";
      let LEFTBAR_COLOR = "#8742f5";
      let TOPBAR_COLOR = "#42c8f5";
      let BACKGROUND = "#7ef542";

      let LEFTBAR_CATEGORY_COLOR = "RED";
      let LEFTBAR_BUTTON_COLOR = "YELLOW";

      let LEFTBAR_BUTTON_TEXT_COLOR = "GREEN";
      let LEFTBAR_CATEGORY_TEXT_COLOR = "GREEN";

      //@ts-ignore
      document.getElementsByClassName("shell-left")[0].style.backgroundColor  = LEFTBAR_COLOR;
      document.getElementById("top-toolbar").style.backgroundColor = TOPBAR_COLOR;

      //@ts-ignore
      document.getElementsByTagName("body")[0].style.background = BACKGROUND;

      let buttons = document.getElementsByClassName("menu-item");
      for (let i = 0; i < buttons.length; i++)
      {
         //@ts-ignore
         buttons[i].style.background = LEFTBAR_BUTTON_COLOR;
         //@ts-ignore
         buttons[i].style.color = LEFTBAR_BUTTON_TEXT_COLOR;
      }

      let categoryButtons = document.getElementsByClassName("group-toggle");
      for (let i = 0; i < categoryButtons.length; i++)
      {
         //@ts-ignore
         categoryButtons[i].style.background = LEFTBAR_CATEGORY_COLOR;
         //@ts-ignore
         categoryButtons[i].style.color = LEFTBAR_CATEGORY_TEXT_COLOR;
      }

      setTimeout(() =>
      {
         let blades = document.getElementsByClassName("blade");
         for (let i = 0; i < blades.length; i++)
         {
            //@ts-ignore
            blades[i].style.background = BLADE_COLOR;
            //@ts-ignore
            blades[i].style.borderRight = "1px solid " + BLADE_BORDER_COLOR;
         }
         
         let sides = document.getElementsByClassName("shell-left-toggle");
         for (let i = 0; i < sides.length; i++)
         {
            //@ts-ignore
            sides[i].style.background = BLADE_CLOSED_COLOR;
         }
      }, 1500);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params: IBladeSettingsParams) 
   {
      super.refreshBlade(params);

      this.Init();
   }

   public async Init(): Promise<void>
   {
      this.loading(true);
      try
      {
         let data = await this.techboardApi.getSettingList();
         let settings = data['Settings'];

         settings.forEach(setting => 
         {
            if (setting.Tag == "AutoCollapse")
            {
               this.autoCollapse(JSON.parse(setting.Contents));
            }   
            else if (setting.Tag == "ThemePreset")
            {
               this.selectedPreset(setting.Contents);
            }
         });
      }
      finally
      {
         this.loading(false);
      }
   }

   public async save(): Promise<void>
   {
      if (this.isLoading()) 
      {
         return;
      }

      // create and update individual records for the different settings as records are generalized

      let autoCollapseSetting: ISetting = 
      {
         Contents: this.autoCollapse(),
         ForUserID: $$.Session.User.ID,
         Tag: "AutoCollapse"
      };
      GlobalCommunications.autoCollapse = this.autoCollapse();

      let presetSetting: ISetting = 
      {
         Contents: this.selectedPreset(),
         ForUserID: $$.Session.User.ID,
         Tag: "ThemePreset"
      }

      try 
      {
         this.isLoading(true);

         await this.techboardApi.updateSetting(autoCollapseSetting);
         await this.techboardApi.updateSetting(presetSetting);

         AppMessages.showMessage({ type: MessageType.Success, text: 'Settings successfully saved' });
      } 
      catch (error) 
      {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });
      } 
      finally 
      {
         this.isLoading(false);
         window.location.reload();
      }
   }
}