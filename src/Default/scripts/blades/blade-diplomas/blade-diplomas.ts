import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-diplomas.html';
import './blade-diplomas.css';
import { TechboardApi, IDiploma } from '../../common/api/techboard-api';
import { BladeDiploma } from '../blade-diploma/blade-diploma';
import { Session } from '../../common/utils/session';
import { BladeStudentDiploma } from '../blade-student-diploma/blade-student-diploma';
import { IFilterControl } from '../../components/app-complex-search/app-complex-search';
import { GlobalCommunications } from '../../global-communications';

export interface IBladeDiplomasParams extends IBladePackage 
{

}

const STATE_NEW = 'new';

// represents a list of all diplomas created
export class BladeDiplomas extends Blade<IBladeDiplomasParams> 
{
   public techApi: TechboardApi = new TechboardApi();
   public data: KnockoutObservable<any[]> = ko.observable([]);
   public selectedDiploma: KnockoutObservable<IDiploma> = ko.observable(null);
   public loading: KnockoutObservable<boolean> = ko.observable(false);
   public viewAsStudent: boolean = false;

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Small);
      this.title("Diplomas");

      this.addDisposable(this.selectedDiploma.subscribe((value) =>
      {
         this.select(value);
      }));
   }

   public async init(): Promise<void>
   {
      this.loading(true);
      try
      {
         let data = await this.techApi.getDiplomaList();
         let diplomas: any[] = data['Diplomas'];

         // format filtered list to have level and level value before name
         diplomas.forEach(diploma => 
         {
            diploma.preTitle = 'LEVEL ' + diploma.Level + ' ';   
         });

         this.data(diplomas);

         if (this.selectedDiploma() == null)
         {
            let state = this.currentState;
            let selectedDiploma = this.data().find(x => x.ID.toString() == state);
            this.selectedDiploma(selectedDiploma)
         }
      }
      finally
      {
         this.loading(false);
      }
   }

   public refreshUrlState(): void {
      super.refreshUrlState();

      let state = this.urlState().next();

      if (state) 
      {
         switch (state) 
         {
            case "new":
               this.launchBlade(BladeDiploma, {
                  onsave: (newClass: IDiploma) => {
                     this.selectedDiploma(newClass);
                     this.init();
                  },
                  ondelete: () => {
                     this.init();
                  }
               });
               break;
            default:
               if (this.selectedDiploma() == null)
               {
                  this.closeBladesFromTheRight();
                  this.selectedDiploma(null);
                  return;
               }

               // open editing version if user is admin by default
               if (Session.isFeatureEnabled('Admin'))
               {
                  if (this.viewAsStudent)
                  {
                     this.launchBlade(BladeStudentDiploma, 
                     {
                        diplomaID: ko.observable(this.selectedDiploma().ID),
                     });
                  }
                  else
                  {
                     this.launchBlade(BladeDiploma, 
                     {
                        diploma: this.selectedDiploma,
                        onsave: () => 
                        {
                           this.init();
                        },
                        ondelete: () => 
                        {
                           this.selectedDiploma(null);
                           this.init();
                        },
                        onViewAsStudent: (diplomaId: string) => 
                        {
                           this.selectAsStudent(diplomaId);
                        }
                     });
                  }
               }
               // otherwise open viewing version
               else
               {
                  this.launchBlade(BladeStudentDiploma, 
                  {
                     diplomaID: ko.observable(this.selectedDiploma().ID),
                  });
               }
               break;
         }
      }
   }

   public select(diploma: IDiploma): void
   {
      if (diploma != null)
      {
         this.viewAsStudent = false;
         this.updateState(diploma.ID.toString());
      }
   }  

   public selectAsStudent(diplomaId: string): void
   {
      if (diplomaId != null)
      {
         this.viewAsStudent = true;
         this.updateState(diplomaId);
      }
   }

   public newDiploma(): void
   {
      this.updateState(STATE_NEW);
      this.selectedDiploma(null);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeDiplomasParams) 
   {
      super.refreshBlade(params);

      this.init();
   }

   public isAdmin(): boolean
   {
      return Session.isFeatureEnabled('Admin');
   }

   public processTitle(level: number, title: string): string
   {
      let temp = title;
      if (title.toLocaleLowerCase().includes("diploma"))
      {
         let tempSplit = title.split(" ");
         temp = tempSplit.slice(2, tempSplit.length).join(" ");
      }
      return "LEVEL " + level.toString() + " " + temp.toUpperCase();
   }
}
