import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-assessments.html';
import './blade-assessments.css';
import { TechboardApi, IClass, IAssessment } from '../../common/api/techboard-api';
import { BladeClass, person } from '../blade-class/blade-class';
import { UrlState } from '../../common/utils/url-state';
import { Session } from '../../common/utils/session';
import { BladeStudentClass } from '../blade-student-class/blade-student-class';
import { GlobalCommunications } from '../../global-communications';
import { IFilter } from '../../components/app-complex-search/app-complex-search';
import { BladeAssessment } from '../blade-assessment/blade-assessment';

export interface IBladeAssessmentsParams extends IBladePackage 
{
   students: KnockoutObservable<person[]>,
   classID: KnockoutObservable<number>;
}

const STATE_NEW = 'new';

// represents all assessments related to given class
export class BladeAssessments extends Blade<IBladeAssessmentsParams> 
{
   public techApi: TechboardApi = new TechboardApi();
   public data: KnockoutObservable<any[]> = ko.observable([]);
   public selectedAssessment: KnockoutObservable<IAssessment> = ko.observable(null);
   public loading: KnockoutObservable<boolean> = ko.observable(false);

   public isAdmin: KnockoutObservable<boolean> = GlobalCommunications.isAdmin;
   public isTeacher: KnockoutObservable<boolean> = GlobalCommunications.isTeacher;
   public classID: KnockoutObservable<number> = ko.observable();
   public students: KnockoutObservable<person[]> = ko.observable([]);

   private _lastClassID = null;

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Tiny);
      this.title("Assessments");

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

      this.addDisposable(this.selectedAssessment.subscribe((value) =>
      {
         this.select(value);
      }));
   }

   public async init(): Promise<void>
   {
      this.loading(true);
      try
      {
         let data: any[] = [];
         data = await this.techApi.getAssessmentListByClassID(this.classID());
         data = data['Assessments'];
         this.data(data);

         // if assessment is null then attempt to use url to locate record
         if (this.selectedAssessment() == null)
         {
            let state = this.currentState;
            let selectedAssessment = this.data().find(x => x.ID.toString() == state);
            this.selectedAssessment(selectedAssessment)
         }
      }
      finally
      {
         this.loading(false);
      }

      if (this._lastClassID != this.classID())
      {
         this.selectedAssessment(null);
         this.closeBladesFromTheRight();
      }
      this._lastClassID = this.classID();
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
               this.launchBlade(BladeAssessment, 
               {
                  classID: this.classID,
                  onsave: (newAssessment: IAssessment) => 
                  {
                     this.selectedAssessment(newAssessment);
                     this.init();
                  },
                  ondelete: () => 
                  {
                     this.init();
                  }
               });
               break;
            default:
               if (this.selectedAssessment() == null)
               {
                  this.closeBladesFromTheRight();
                  this.selectedAssessment(null);
                  return;
               }

               if (GlobalCommunications.CanAccess("Manage-Classes"))
               {
                  this.launchBlade(BladeAssessment, 
                  {
                     assessment: this.selectedAssessment,
                     classID: this.classID,
                     students: this.students,
                     onsave: () => 
                     {
                        this.init();
                     },
                     ondelete: () => 
                     {
                        this.selectedAssessment(null);
                        this.init();
                     }
                  });
               }
               else
               {
                  this.launchBlade(BladeAssessment, 
                  {
                     assessment: this.selectedAssessment,
                     classID: this.classID,
                     students: this.students,
                  });
               }
               break;
         }
      }
   }

   public select(assessment: IAssessment): void
   {
      if (assessment != null)
      {
         this.updateState(assessment.ID.toString());
      }
   }  

   public newAssessment(): void
   {
      this.updateState(STATE_NEW);
      this.selectedAssessment(null);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeAssessmentsParams) 
   {
      super.refreshBlade(params);

      this.classID = params.classID;
      this.students = params.students;

      this.init();
   }
}
