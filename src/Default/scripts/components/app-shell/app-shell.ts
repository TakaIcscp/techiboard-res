import { BladeDashboard } from '../../blades/blade-dashboard/blade-dashboard';
import { UrlState } from '../../common/utils/url-state';
import { AbstractComponent, IAbstractComponentParams } from '../../common/decorator/component';
import { SessionApi, ANONYMOUS_USER } from '../../common/api/session-api';
import { Component } from '../../common/decorator/component';
import { BladeIdentityManagement } from '../../blades/blade-users/blade-users';
import { BladeUserGroups } from '../../blades/blade-user-groups/blade-user-groups';
import { BladeMyAccount } from '../../blades/blade-my-account/blade-my-account';
import { Session } from '../../common/utils/session';

import * as html from './app-shell.html';
import './app-shell.css';
import { IBladeConstructor } from '../app-blades/app-blades';
import { BladeNoticeboard } from '../../blades/blade-noticeboard/blade-noticeboard';
import { BladeTimetable } from '../../blades/blade-timetable/blade-timetable';
import { BladeDiplomas } from '../../blades/blade-diplomas/blade-diplomas';
import { BladeClasses } from '../../blades/blade-classes/blade-classes';
import { TechboardApi, IProfile } from '../../common/api/techboard-api';
import { GlobalCommunications } from '../../global-communications';
import { BladeSupport } from '../../blades/blade-support/blade-support';
import { BladeVersionLogs } from '../../blades/blade-version-logs/blade-version-logs';
import { BladeResources } from '../../blades/blade-resources/blade-resources';
import { BladeMemos } from '../../blades/blade-memos/blade-memos';
import { BladeSettings } from '../../blades/blade-settings/blade-settings';
import { BladeReport } from '../../blades/blade-report/blade-report';
import { BladeNotices } from '../../blades/blade-notices/blade-notices';
import { BladeTeam } from '../../blades/blade-team/blade-team';

export enum MenuTab 
{
   Dashboard = 'dashboard',
   Users = 'users',
   MyProfile = 'myprofile',
   UserGroups = 'usergroups',
   Noticeboard = 'noticeboard',
   Timetable = "timetable",
   Diplomas = "diplomas",
   Classes = "classes",
   Support = "support",
   VersionLogs = "log",
   GeneralResources = "general",
   HelpResources = "help",
   Memos = "memos",
   Graph = "graph",
   Report = "report",
   Settings = "settings",
   Notices = "notices",
   Team = "team"
}

export interface IShellParams extends IAbstractComponentParams 
{
}

export interface IMenuItemGroup
{
   opensDown: boolean,
   title: string,
   open: boolean,
   position?: string,
   items: IMenuItem[],
   notGroup?: boolean,
   requires?: string,
   ignoreAdmin?: boolean
}

export interface IMenuItem 
{
   title: string;
   icon: string;
   blade?: IBladeConstructor<any>;
   menuTab?: MenuTab;
   disable?: boolean;
   requires?: string;
   bracketType?: string;
   ifMobile?: boolean;
}

@Component({ name: 'app-shell', template: html })
export class AppShell extends AbstractComponent<IShellParams> 
{
   public Profile: KnockoutObservable<IProfile> = GlobalCommunications.Profile;
   public isLoggedIn: KnockoutObservable<boolean> = ko.observable(false);
   public isLoggingOut: KnockoutObservable<boolean> = ko.observable(false);
   public isChangingUser: KnockoutObservable<boolean> = ko.observable(false);
   public isAnonymous: KnockoutObservable<boolean> = ko.observable(false);
   public version: KnockoutObservable<string> = ko.observable();
   public isMobile: KnockoutObservable<boolean> = GlobalCommunications.isMobile;

   public techboardApi: TechboardApi = new TechboardApi();
   public sessionApi: SessionApi = new SessionApi();
   public urlState: UrlState = UrlState.sharedInstance().mine();

   public sidebarOpen: KnockoutObservable<boolean> = ko.observable(true);

   public menuGroups: KnockoutObservable<IMenuItemGroup[]> = ko.observable
   ([
      {
         items: [
                  { title: 'Your Dashboard', icon: 'fa fa-home', blade: BladeDashboard, menuTab: MenuTab.Dashboard },
                  //{ title: 'Timetable', icon: 'far fa-calendar-alt', blade: BladeTimetable, menuTab: MenuTab.Timetable },
                  //{ title: 'Noticeboard', icon: 'fas fa-clipboard-list', blade: BladeNoticeboard, menuTab: MenuTab.Noticeboard },
                ],
         open: null,
         opensDown: null,
         title: null,
         notGroup: true
      },
      { 
         opensDown: true,
         title: "Personal",
         open: false,
         items: 
         [
            { title: 'Memos', icon: 'fas fa-bell', blade: BladeMemos, menuTab: MenuTab.Memos },
            { title: 'Your Profile', icon: 'fa fa-user', blade: BladeMyAccount, menuTab: MenuTab.MyProfile }
         ]
      },
      {
         requires: 'Students',
         ignoreAdmin: true,
         opensDown: true,
         title: "Information",
         open: false,
         items:
         [
            { title: 'Meet The Team', icon: 'fas fa-users', blade: BladeTeam, menuTab: MenuTab.Team, isMobile: true },
            { title: 'Classes', icon: 'fas fa-chalkboard-teacher', blade: BladeClasses, menuTab: MenuTab.Classes, isMobile: true },
            { title: 'Diplomas', icon: 'fas fa-graduation-cap', blade: BladeDiplomas, menuTab: MenuTab.Diplomas, isMobile: true },
            { title: 'Resources', icon: 'fas fa-archive', blade: BladeResources, menuTab: MenuTab.GeneralResources }
         ]
      },
      {
         requires: 'Teachers',
         opensDown: true,
         title: "Management",
         open: false,
         items:
         [
            { title: 'Classes', icon: 'fas fa-chalkboard-teacher', blade: BladeClasses, menuTab: MenuTab.Classes },
            { title: 'Diplomas', icon: 'fas fa-graduation-cap', blade: BladeDiplomas, menuTab: MenuTab.Diplomas },
            { title: 'Users', icon: 'fa fa-users', blade: BladeIdentityManagement, menuTab: MenuTab.Users, requires: 'View-Users' },
            //{ title: 'User Groups', icon: 'fa fa-users', blade: BladeUserGroups, menuTab: MenuTab.UserGroups, requires: 'Admin' },
            { title: 'Resources', icon: 'fas fa-archive', blade: BladeResources, menuTab: MenuTab.GeneralResources },
            { title: 'Notices', icon: 'fas fa-clipboard-list', blade: BladeNotices, menuTab: MenuTab.Notices, requires: 'Admin' },
         ]
      },
      {
         opensDown: false,
         title: "Student Help",
         open: false,
         position: "BOTTOM",
         items:
         [
            { title: 'Resources', icon: 'fas fa-archive', blade: BladeResources, menuTab: MenuTab.HelpResources, isMobile: true },
            { title: 'Report', icon: 'fas fa-flag', blade: BladeReport, menuTab: MenuTab.Report },
         ]
      },
      {
         opensDown: false,
         title: "Site Info",
         open: false,
         position: "BOTTOM",
         items:
         [
            { title: 'Settings', icon: 'fas fa-cog', blade: BladeSettings, menuTab: MenuTab.Settings, isMobile: true },
            { title: 'Site Support', icon: 'fas fa-question', blade: BladeSupport, menuTab: MenuTab.Support },
            { title: 'Version Logs', icon: 'fas fa-code-branch', blade: BladeVersionLogs, menuTab: MenuTab.VersionLogs, isMobile: true }
         ]
      }
   ]);
   //{ title: 'Graph Test', icon: 'fas fa-cog', blade: BladeGraph, menuTab: MenuTab.Graph }

   public selectedMenu: KnockoutObservable<IMenuItem> = ko.observable(null);

   constructor(params: IShellParams) 
   {
      super(params);

      GlobalCommunications._shellInstance = this;

      let sessionId: string = $$.Session && $$.Session.ID;
      let userId: string = $$.Session && $$.Session.User && $$.Session.User.ID;

      this.isLoggedIn(!!sessionId && userId !== ANONYMOUS_USER);
      this.isAnonymous(userId === ANONYMOUS_USER);

      let tab = this.urlState.next();
      if (tab == null || tab == "")
      {
         tab = "dashboard";
      }
      this.menuGroups().forEach((group) =>
      {
         group.items.forEach(menu => 
         {
            if (menu.menuTab === tab)
            {
               this.selectMenu(menu);
               this.toggleMenuGroup(group);
            }   
         });
      });

      this.version($$.UIVersion ? 'v. ' + $$.UIVersion : "");

      if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
      || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
         GlobalCommunications.isMobile(true);
         this.sidebarOpen(false);
      }

      this.Init();

      GlobalCommunications.WindowSizeWatcher();
   }

   public async Init(): Promise<void>
   {
      try
      {
         if (this.isLoggedIn())
         {
            this.Profile(await this.techboardApi.getProfile());

            GlobalCommunications.isStudent($$.Session.AccessPermissions.UserGroups.some(x => x === "Students"));
            GlobalCommunications.isTeacher($$.Session.AccessPermissions.UserGroups.some(x => x === "Teachers"));
            GlobalCommunications.isAdmin($$.Session.AccessPermissions.EnabledFeatures.some(x => x === "Admin"));

            let data = await this.techboardApi.getSettingList();
            let settings = data['Settings'];
   
            settings.forEach(setting => 
            {
               if (setting.Tag == "AutoCollapse")
               {
                  GlobalCommunications.autoCollapse = JSON.parse(setting.Contents);
               }   
               if (setting.Tag == "ThemePreset")
               {
                  let theme = BladeSettings.presets.find(x => x.id == setting.Contents);
                  if (theme != null && theme.id != "default")
                  {
                     //@ts-ignore
                     document.getElementsByClassName("shell-left")[0].style.backgroundColor  = theme.leftbarcolor;
                     document.getElementById("top-toolbar").style.backgroundColor = theme.topbarcolor;

                     //@ts-ignore
                     document.getElementsByTagName("body")[0].style.background = theme.background;
                  }
               }
            });
         }
      }
      catch
      {

      }
   }

   public dispose(): void 
   {
      super.dispose();

      GlobalCommunications._shellInstance = null;
   }

   public selectMenu(menu: IMenuItem): void 
   {
      if (menu.disable) 
      {
         return;
      }

      this.urlState.setState(menu.menuTab);
      this.urlState.next();

      this.selectedMenu(menu);
   }

   public getMenuURL(menu: IMenuItem): string 
   {
      return `${$$.Root}${menu.menuTab}`;
   }

   public isGroupEnabled(group: IMenuItemGroup): boolean
   {
      if (!group.requires) return true;
      return GlobalCommunications.CanAccessGroup(group.requires, group.ignoreAdmin == null ? false : group.ignoreAdmin);
   }

   public isItemEnabled(menu: IMenuItem): boolean 
   {
      if (!menu.requires) return true;
      return GlobalCommunications.CanAccess(menu.requires);
   }

   public toggleMenuGroup(group: IMenuItemGroup): void
   {
      let groups = this.menuGroups();

      let oldValue = group.open;

      if (GlobalCommunications.autoCollapse == true)
      {
         groups.forEach((g) =>
         {
            g.open = false;
         });
      }
      group.open = !oldValue;

      this.menuGroups([]);
      this.menuGroups(groups);
   }

   public toggleSidebar(): void
   {
      this.sidebarOpen(!this.sidebarOpen());
   }

   public switchToMemos(): void
   {
      let menu = this.menuGroups()[1].items.find(x => x.title == "Memos");
      this.selectMenu(menu);

      this.menuGroups()[1].open = true;
      this.menuGroups.notifySubscribers();
   }
}
