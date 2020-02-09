import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-classes.html';
import './blade-classes.css';
import { TechboardApi, IClass } from '../../common/api/techboard-api';
import { BladeClass } from '../blade-class/blade-class';
import { UrlState } from '../../common/utils/url-state';
import { Session } from '../../common/utils/session';
import { BladeStudentClass } from '../blade-student-class/blade-student-class';
import { GlobalCommunications } from '../../global-communications';
import { IFilter } from '../../components/app-complex-search/app-complex-search';

export interface IBladeClassesParams extends IBladePackage 
{

}

const STATE_NEW = 'new';

// represents all classes related to logged in user
export class BladeClasses extends Blade<IBladeClassesParams> 
{
   public techApi: TechboardApi = new TechboardApi();
   public data: KnockoutObservable<any[]> = ko.observable([]);
   public selectedClass: KnockoutObservable<IClass> = ko.observable(null);
   public loading: KnockoutObservable<boolean> = ko.observable(false);

   public isAdmin: KnockoutObservable<boolean> = GlobalCommunications.isAdmin;
   public isTeacher: KnockoutObservable<boolean> = GlobalCommunications.isTeacher;

   // filters to alter displayed classes
   public filters: KnockoutObservable<IFilter[]> = ko.observable
   ([
      { title: 'Hide Graduated', desiredValue: true, variableId: 'Graduated', checked: false, unique: true },
      { title: 'Hide Not Graduated', desiredValue: false, variableId: 'Graduated', checked: false, unique: true }
   ]);1

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Tiny);
      this.title("Classes");

      this.addDisposable(
         GlobalCommunications.isAdmin.subscribe((value) => 
         {
            this.init();
         })
      )

      this.addDisposable(
         GlobalCommunications.isTeacher.subscribe((value) =>
         {
            this.init();
         })
      );

      this.addDisposable(this.selectedClass.subscribe((value) =>
      {
         this.select(value);
      }));
   }

   public async init(): Promise<void>
   {
      this.loading(true);
      try
      {
         // if admin attempt to get all classes
         let data: any[] = [];
         if (GlobalCommunications.isAdmin())
         {
            data = await this.techApi.getClassList();
            data = data['Classes'];
         }
         // if not admin get only related classes
         else
         {
            data = await this.techApi.getClassesByProfileID($$.Session.User.ID);
            data = data['Classes'];
         }
         this.data(data);

         if (this.selectedClass() == null)
         {
            let state = this.currentState;
            let selectedClass = this.data().find(x => x.ID.toString() == state);
            this.selectedClass(selectedClass)
         }
      }
      finally
      {
         this.loading(false);
      }
   }

   public refreshUrlState(): void 
   {
      super.refreshUrlState();

      let state = this.urlState().next();

      if (state) 
      {
         switch (state) 
         {
            case "new":
               this.launchBlade(BladeClass, 
               {
                  onsave: (newClass: IClass) => 
                  {
                     this.selectedClass(newClass);
                     this.init();
                  },
                  ondelete: () => 
                  {
                     this.init();
                  }
               });
               break;
            default:
               if (this.selectedClass() == null)
               {
                  this.closeBladesFromTheRight();
                  this.selectedClass(null);
                  return;
               }

               // check if logged in user has permission to open editing class blade
               if (GlobalCommunications.CanAccess("Manage-Classes"))
               {
                  this.launchBlade(BladeClass, 
                  {
                     classID: ko.observable(this.selectedClass().ID),
                     onsave: () => 
                     {
                        this.init();
                     },
                     ondelete: () => 
                     {
                        this.selectedClass(null);
                        this.init();
                     }
                  });
               }
               // if user does not have editing permissions then open student version
               else
               {
                  this.launchBlade(BladeStudentClass, 
                  {
                     classID: ko.observable(this.selectedClass().ID)
                  });
               }
               break;
         }
      }
   }

   public select(clas: IClass): void
   {
      if (clas != null)
      {
         this.updateState(clas.ID.toString());
      }
   }  

   public newClass(): void
   {
      this.updateState(STATE_NEW);
      this.selectedClass(null);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeClassesParams) 
   {
      super.refreshBlade(params);

      this.init();
   }
}
