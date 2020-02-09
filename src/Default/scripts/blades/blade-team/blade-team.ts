import { Blade, BladeSize } from '../../components/app-blade/blade';

import * as html from './blade-team.html';
import './blade-team.less';
import { TechboardApi } from '../../common/api/techboard-api';
import { GlobalCommunications } from '../../global-communications';

export interface IBladeTeamParams 
{
}

interface Person
{
   image: string;
   name: string;
   position: string;
   email: string;
}

export class BladeTeam extends Blade<IBladeTeamParams> 
{
   public techboardApi: TechboardApi = new TechboardApi();

   // represents the different staff categories
   public rows: KnockoutObservable<any[]> = ko.observable
   ([
      [
         { image: GlobalCommunications.getLocalFilePath("staff/FLAUI.jpg"), name: "FLAUI", position: "General Manager Operations", email: "flaui.muaulu@techtorium.ac.nz" },
         { image: GlobalCommunications.getLocalFilePath("staff/ELI.jpg"), name: "ELI", position: "Head of Student Engagement", email: "eli.faamatau@techtorium.ac.nz" },
         { image: GlobalCommunications.getLocalFilePath("staff/POONAM.jpg"), name: "POONAM", position: "Head of Student Services", email: "poonam.deo@techtorium.ac.nz" },
         { image: GlobalCommunications.getLocalFilePath("staff/PHILL.jpg"), name: "PHILL", position: "Head of Pathways", email: "phillip.spear@techtorium.ac.nz" },
         { image: GlobalCommunications.getLocalFilePath("staff/LYALL.jpg"), name: "LYALL", position: "Employment Pathways Manager", email: "lyall.haselton@techtorium.ac.nz" },
         { image: GlobalCommunications.getLocalFilePath("staff/DANIELLE.jpg"), name: "DANIELLE", position: "Programme Lead Secondary Schools", email: "danielle.natana@techtorium.ac.nz" },
      ],
      [
         { image: GlobalCommunications.getLocalFilePath("staff/MIKE.jpg"), name: "MIKE", position: "Programme Lead, L7 Engineering", email: "mike.birmingham@techtorium.ac.nz" },
         { image: GlobalCommunications.getLocalFilePath("staff/LYALL2.jpg"), name: "LYALL", position: "Programme Lead, L6 Engineering", email: "lyall.johnson@techtorium.ac.nz" },
         { image: GlobalCommunications.getLocalFilePath("staff/DICK.jpg"), name: "DICK", position: "L6 Computer Engineering Trainer", email: "dick.cook@techtorium.ac.nz" },
         { image: GlobalCommunications.getLocalFilePath("staff/MARIUS.jpg"), name: "MARIUS", position: "Programme Lead, L5 Engineering", email: "marius.wright@techtorium.ac.nz" },
         { image: GlobalCommunications.getLocalFilePath("staff/SAM.jpg"), name: "SAM", position: "L5 Computer Engineering Trainer", email: "sam.rashid@techtorium.ac.nz" },
         //{ image: "", name: "BURJIZ", position: "L5 Computer Engineering Trainer", email: "burjiz.soorty@techtorium.ac.nz" },
      ],
      [
         { image: GlobalCommunications.getLocalFilePath("staff/MASOUD.jpg"), name: "MASOUD", position: "Software Development Trainer", email: "masoud.shakiba@techtorium.ac.nz" },
         { image: GlobalCommunications.getLocalFilePath("staff/AZAM.jpg"), name: "AZAM", position: "Software Development Trainer", email: "azam.zavvari@techtorium.ac.nz" },
         //{ image: "", name: "ALEXIS", position: "Software Development Trainer", email: "alexis.jones@techtorium.ac.nz" },
      ],
      [
         { image: GlobalCommunications.getLocalFilePath("staff/PENNY.jpg"), name: "PENNY", position: "Administrator", email: "penny.hutchinson@techtorium.ac.nz" },
         { image: GlobalCommunications.getLocalFilePath("staff/RUBY.jpg"), name: "RUBY", position: "Student Administrator", email: "ruby.clarken@techtorium.ac.nz" },
         { image: GlobalCommunications.getLocalFilePath("staff/ANGELA.jpg"), name: "ANGELA", position: "Student Administrator", email: "angela.ahlam@techtorium.ac.nz" },
         { image: GlobalCommunications.getLocalFilePath("staff/NAVPREET.jpg"), name: "NAVPREET", position: "Student Administrator", email: "navpreet.bhullar@techtorium.ac.nz" },
      ]
   ]);

   constructor() 
   {
      super();

      this.html = html;
      this.title('Meet The Team');
      this.size(BladeSize.Medium);
      this.canMaximize(false);
      this.isMaximized(true);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params: IBladeTeamParams) 
   {
      super.refreshBlade(params);
   }
}