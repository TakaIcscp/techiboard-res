import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-student-class.html';
import './blade-student-class.css';
import { IClass, TechboardApi, IUTC, IDiploma } from '../../common/api/techboard-api';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { ErrorUtils } from '../../common/utils/error-utils';
import { IFilterControl } from '../../components/app-filtered-search/app-filtered-search';
import { BladeStaffMember } from '../blade-staff-member/blade-staff-member';
import { BladeStudentDiploma } from '../blade-student-diploma/blade-student-diploma';
import { BladeAssessments } from '../blade-assessments/blade-assessments';

export interface IBladeStudentClassParams extends IBladePackage 
{
   classID?: KnockoutObservable<number>;
}

interface person
{
   id?: string,
   name: string
}

const STATE_DIPLOMA = 'diploma';
const STATE_ASSESSMENTS = 'assessments';

// represents the student view of a class
export class BladeStudentClass extends Blade<IBladeStudentClassParams> 
{
   public selectedTeacher: KnockoutObservable<person> = ko.observable(null);

   public Students: KnockoutObservable<person[]> = ko.observable([]);
   public Teachers: KnockoutObservable<person[]> = ko.observable([]);
   public LeadTeacherString: KnockoutObservable<string> = ko.observable(null);

   public techApi: TechboardApi = new TechboardApi();
   public classID: KnockoutObservable<number> = ko.observable(null);

   public ID: KnockoutObservable<number> = ko.observable(null);
   public DiplomaID: KnockoutObservable<number> = ko.observable(null);
   public TimeBracketID: KnockoutObservable<number> = ko.observable(null);
   public Tag: KnockoutObservable<string> = ko.observable(null);
   public Active: KnockoutObservable<boolean> = ko.observable(null);
   public Graduated: KnockoutObservable<boolean> = ko.observable(null);

   public isLoading: KnockoutObservable<boolean> = ko.observable(false);
   public diplomaRecord: KnockoutObservable<IDiploma> = ko.observable(null);

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Medium);
      this.title("Class");

      this.addDisposable
      (
         this.classID.subscribe((value) => 
         {
            this.init();
         })
      );

      this.addDisposable
      (
         this.selectedTeacher.subscribe((teacher) => 
         {
            if (teacher != null)
            {
               this.updateState(teacher.name.replace(".", "*"));
            }
            else
            {
               this.closeBladesFromTheRight();
            }
         })
      );

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

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeStudentClassParams) 
   {
      super.refreshBlade(params);

      if (params.classID != null)
      {
         this.classID = params.classID;
      }

      this.init();
   }

   public async init(): Promise<void>
   {
      let clas = null;
      if (this.classID() != null && this.classID() != 0)
      {
         clas = await this.techApi.getClassById(this.classID());
      }

      this.selectedTeacher(null);
      this.Teachers([]);
      this.Students([]);

      this.LeadTeacherString(null);
      if (clas == null)
      {
         this.title("New Class");

         this.ID(null);
         this.DiplomaID(null);
         this.diplomaRecord(null);
         this.TimeBracketID(null);
         this.Tag(null);
         this.Active(null);
         this.Graduated(null);
      }
      else
      {
         this.ID(clas.ID);
         this.DiplomaID(clas.DiplomaID);
         if (this.DiplomaID() != null && this.DiplomaID() != 0)
         {
            this.diplomaRecord(await this.techApi.getDiplomaById(this.DiplomaID()));
         }
         else
         {
            this.diplomaRecord(null);
         }
         this.TimeBracketID(clas.TimeBracketID);
         this.Tag(clas.Tag);
         this.Active(clas.Active);
         this.Graduated(clas.Graduated);

         let students: person[] = [];
         let teachers: person[] = [];

         let people = await this.techApi.getProfileListByClass(this.ID());
         people = people['Links'];

         for (let i = 0; i < people.length; i++)
         {
            let personLink = people[i];
            let person: person;

            person = 
            {
               id: personLink.ProfileID.toString(),
               name: personLink.ProfileID != null ? personLink.ProfileID.toString() : null                  
            }

            if (personLink.Type == 'STUDENT')
            {
               students.push(person);
            }
            else
            {
               teachers.push(person);

               if (personLink.Type == "LEAD_TEACHER")
               {
                  this.LeadTeacherString(person.name);
               }
            }
         }

         this.Students(students);
         this.Teachers(teachers);

         this.title("Class " + this.Tag());
      }
   }

   
   public refreshUrlState(): void 
   {
      super.refreshUrlState();

      let state = this.urlState().next();

      if (state == "diploma")
      {
         this.launchBlade(BladeStudentDiploma, 
         {
            diplomaID: this.DiplomaID
         });
         this.isMinimized(true);
      }
      else if (state == "assessments")
      {
         this.launchBlade(BladeAssessments,
         {
            students: this.Students,
            classID: this.classID
         })
         this.isMinimized(true);
      }
      else if (state) 
      {
         this.launchBlade(BladeStaffMember, 
         {
            ID: state.toString().replace("*", ".")
         });
      }
   }

   public openDiploma(): void
   {
      this.updateState(STATE_DIPLOMA);
   }

   public viewAssessments(): void
   {
      this.updateState(STATE_ASSESSMENTS);
   }
}
