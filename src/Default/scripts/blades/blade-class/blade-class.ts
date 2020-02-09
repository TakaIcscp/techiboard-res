import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-class.html';
import './blade-class.css';
import { IClass, TechboardApi, IUTC, IDiploma, IClassProfileLink } from '../../common/api/techboard-api';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { ErrorUtils } from '../../common/utils/error-utils';
import { IFilterControl } from '../../components/app-filtered-search/app-filtered-search';
import { BladeUser } from '../blade-user/blade-user';
import { BladeGraph } from '../blade-graph/blade-graph';
import { BladeAssessments } from '../blade-assessments/blade-assessments';

export interface IBladeClassParams extends IBladePackage 
{
   classID?: KnockoutObservable<number>;

   onsave?: (clas: IClass) => void;
   ondelete?: () => void;
}

export interface person
{
   id?: string,
   name: string
}

interface diploma
{
   id?: string,
   name: string
}

const STATE_ATTENDANCE = 'attendance';
const STATE_ASSESSMENTS = 'assessments';

export class BladeClass extends Blade<IBladeClassParams> 
{
   // arrays of available to add people
   public studentList: KnockoutObservable<person[]> = ko.observable();
   public teacherList: KnockoutObservable<person[]> = ko.observable();

   // controls related to adding teachers
   public teacherControls: KnockoutObservable<IFilterControl[]> = ko.observable(
   [
      { text: "Add", icon: "fas fa-plus", size: 18, clickEvent: (id: string) => this.clickedTeacher(id, true) },
      { text: "Info", icon: "fas fa-question", size: 16, clickEvent: (id: string) => this.selectStudent(id)}
   ]);

   // controls related to added teachers
   public teacherListControls: KnockoutObservable<IFilterControl[]> = ko.observable(
   [
      { text: "Set Lead", icon: "fas fa-crown", clickEvent: (id: string) => this.setLeadTeacher(id) },
      { text: "Remove", icon: "fas fa-times", size: 18, clickEvent: (id: string) => this.clickedTeacher(id, false) },
      { text: "Info", icon: "fas fa-question", size: 16, clickEvent: (id: string) => this.selectStudent(id)}
   ]);

   // controls related to adding students
   public studentControls: KnockoutObservable<IFilterControl[]> = ko.observable(
   [
      { text: "Add", icon: "fas fa-plus", size: 18, clickEvent: (id: string) => this.clickedStudent(id, true)},
      { text: "Info", icon: "fas fa-question", size: 16, clickEvent: (id: string) => this.selectStudent(id)}
   ]);

   // controls related to added students
   public studentListControls: KnockoutObservable<IFilterControl[]> = ko.observable(
   [
      { text: "Remove", icon: "fas fa-times", size: 18, clickEvent: (id: string) => this.clickedStudent(id, false)},
      { text: "Info", icon: "fas fa-question", size: 16, clickEvent: (id: string) => this.selectStudent(id)}
   ]);

   // arrays of added people
   public Students: KnockoutObservable<person[]> = ko.observable([]);
   public Teachers: KnockoutObservable<person[]> = ko.observable([]);

   // all available diplomas to pick from
   public Diplomas: KnockoutObservable<IFilterControl[]> = ko.observable([]);

   // picked diploma for class
   public SelectedDiploma: KnockoutObservable<diploma> = ko.observable(null);

   public selectedStudent: KnockoutObservable<person> = ko.observable(null);
   public selectedTeacher: KnockoutObservable<person> = ko.observable(null);

   public LeadTeacher: KnockoutObservable<person> = ko.observable(null);
   public LeadTeacherString: KnockoutObservable<string> = ko.observable(null);

   public techApi: TechboardApi = new TechboardApi();
   public classID: KnockoutObservable<number> = ko.observable(null);

   // record details
   public ID: KnockoutObservable<number> = ko.observable(null);
   public DiplomaID: KnockoutObservable<number> = ko.observable(null);
   public TimeBracketID: KnockoutObservable<number> = ko.observable(null);
   public Tag: KnockoutObservable<string> = ko.observable(null);
   public Active: KnockoutObservable<boolean> = ko.observable(null);
   public Graduated: KnockoutObservable<boolean> = ko.observable(null);

   public current: string = "";
   public isLoading: KnockoutObservable<boolean> = ko.observable(false);

   public isEditing: KnockoutObservable<boolean> = ko.observable(false);
   private _onsave?: (clas: IClass) => void;
   private _ondelete?: () => void;

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
         this.SelectedDiploma.subscribe((value) =>
         {
            if (value != null)
            {
               this.DiplomaID(parseInt(value.id));
            }
         })
      )

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

   public async refreshBlade(params?: IBladeClassParams) 
   {
      super.refreshBlade(params);

      if (params.classID != null)
      {
         this.classID = params.classID;
      }
      else
      {
         this.classID(null);
      }

      this._onsave = params.onsave;
      this._ondelete = params.ondelete;

      this.init();
   }

   public async init(): Promise<void>
   {
      this.isLoading(true);

      let clas = null;
      if (this.classID() != null && this.classID() != 0)
      {
         clas = await this.techApi.getClassById(this.classID());
      }

      this.studentList([]);
      this.teacherList([]);
      this.Teachers([]);
      this.Students([]);
      this.SelectedDiploma(null);

      let studentsListRec = await this.techApi.getUsersByGroup("Students");
      let studentsList: person[] = [];
      
      if (studentsListRec != null)
      {
         for (let key in studentsListRec)
         {
            studentsList.push(
               {
                  id: key,
                  name: key
               }
            );
         }
      }
      this.studentList(studentsList);

      let teachersListRec = await this.techApi.getUsersByGroup("Teachers");
      let teachersList: person[] = [];

      if (teachersListRec != null)
      {
         for (let key in teachersListRec)
         {
            teachersList.push(
               {
                  id: key,
                  name: key
               }
            );
         }
      }
      this.teacherList(teachersList);

      let rec = await this.techApi.getDiplomaList();
      let diplomas: IDiploma[] = rec['Diplomas'];
      let diplomasList: any[] = [];
      diplomas.forEach((diploma) => 
      {
         diplomasList.push
         ({
            id: diploma.ID,
            name: diploma.Title   
         });
      });
      this.Diplomas(diplomasList);

      this.selectedTeacher(null);
      this.selectedStudent(null);
      this.LeadTeacherString(null);
      this.LeadTeacher(null);

      if (clas == null)
      {
         this.title("New Class");

         this.ID(null);
         this.DiplomaID(null);
         this.TimeBracketID(null);
         this.Tag(null);
         this.Active(null);
         this.Graduated(null);
         this.isEditing(true);
      }
      else
      {
         this.ID(clas.ID);
         this.DiplomaID(clas.DiplomaID);
         if (this.DiplomaID() != null)
         {
            this.SelectedDiploma(diplomasList.find(x => x.id == this.DiplomaID()));
         }
         this.TimeBracketID(clas.TimeBracketID);
         this.Tag(clas.Tag);
         this.Active(clas.Active);
         this.Graduated(clas.Graduated);

         let people = await this.techApi.getProfileListByClass(this.ID());
         people = people['Links'];

         let students: person[] = [];
         let teachers: person[] = [];

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
                  this.LeadTeacher(person);
                  this.LeadTeacherString(person.name);
               }
            }
         }

         // remove students that have already been added from available array
         let studentsList = this.studentList();
         students.forEach(student => 
         {
           let listIndex = studentsList.findIndex(x => x.id == student.id);
           if (listIndex > -1)
            {
               studentsList.splice(listIndex, 1);
            }
         });
         this.Students(students);
         this.studentList(studentsList);

         // remove trainers that have already been added from available array
         let teachersList = this.teacherList();
         teachers.forEach(teacher => 
         {
            let listIndex = teachersList.findIndex(x => x.id == teacher.id);
            if (listIndex > -1)
            {
               teachersList.splice(listIndex, 1);
            }
         });
         this.Teachers(teachers);
         this.teacherList(teachersList);

         this.title("Class " + this.Tag());
         this.isEditing(false);
      }

      this.isLoading(false);
   }

   public async save(): Promise<void>
   {
      if (this.isLoading()) 
      {
         return;
      }

      if (this.Tag() == null || this.Tag() == "")
      {
         AppMessages.showMessage({ type: MessageType.Error, text: 'Please enter a class tag!' });
         return;
      }

      let clas: IClass = 
      {
         ID: this.ID(),
         DiplomaID: this.DiplomaID(),
         TimeBracketID: this.TimeBracketID(),
         Tag: this.Tag(),
         Active: this.Active(),
         Graduated: this.Graduated()
      };

      try 
      {
         this.isLoading(true);

         if (clas.ID == null)
         {
            clas = await this.techApi.postNewClass(clas);
         }
         else
         {
            clas = await this.techApi.postUpdateClass(clas.ID, clas);
         }

         await this.techApi.deleteClassProfileLinks(clas.ID);
         for (let i = 0; i < this.Students().length; i++)
         {
            let person: person = this.Students()[i];

            let link: IClassProfileLink =
            {
               ClassID: clas.ID,
               ProfileID: person.id,
               Type: "STUDENT"
            }
            await this.techApi.postClassProfileLink(clas.ID, person.id, link);
         }

         for (let i = 0; i < this.Teachers().length; i++)
         {
            let person: person = this.Teachers()[i];
            let link: IClassProfileLink =
            {
               ClassID: clas.ID,
               ProfileID: person.id,
               Type: "TEACHER"
            }

            if (this.LeadTeacher() != null && this.LeadTeacher().id == person.id)
            {
               link.Type = "LEAD_TEACHER";
            }

            await this.techApi.postClassProfileLink(clas.ID, person.id, link);
         }

         AppMessages.showMessage({ type: MessageType.Success, text: 'Class successfully saved' });
         if (this._onsave) 
         {
            this._onsave(clas);
         }

      } 
      catch (error) 
      {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });
      } 
      finally 
      {
         this.isLoading(false);
         this.isEditing(false);
      }

      this.init();
   }

   public async remove(): Promise<void>
   {
      if (this.isLoading()) 
      {
         return;
      }

      try 
      {
         this.isLoading(true);

         await this.techApi.deleteClassById(this.ID());

         AppMessages.showMessage({ type: MessageType.Success, text: 'Class successfully removed' });
         if (this._ondelete) 
         {
            this._ondelete();
         }

         this.close();
      } 
      catch (error) 
      {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });
      }
      finally 
      {
         this.isLoading(false);
      }
   }

   public clickedTeacher(id, add: boolean): void
   {
      let teachers = this.Teachers();
      let teacherList = this.teacherList();
      if (add)
      {
         let index = teacherList.findIndex(x => x.id == id);
         teachers.push(teacherList[index]);
         teacherList.splice(index, 1);
      }
      else
      {
         let index = teachers.findIndex(x => x.id == id);
         teacherList.push(teachers[index]);
         if (this.LeadTeacher() != null && this.LeadTeacher().id == teachers[index].id)
         {
            this.LeadTeacher(null);
            this.LeadTeacherString(null);
         }
         teachers.splice(index, 1);
      }
      this.Teachers(teachers);
      this.teacherList(teacherList);
   }

   public setLeadTeacher(id): void
   {
      let teacher = this.Teachers().find(x => x.id == id);

      if (this.LeadTeacher() != null && this.LeadTeacher().id == teacher.id)
      {
         this.LeadTeacher(null);
         this.LeadTeacherString(null);
      }
      else
      {
         this.LeadTeacher(teacher);
         this.LeadTeacherString(teacher.name);
      }
   }

   public clickedStudent(id, add: boolean)
   {
      let students = this.Students();
      let studentList = this.studentList();
      if (add)
      {
         let index = studentList.findIndex(x => x.id == id);
         students.push(studentList[index]);
         studentList.splice(index, 1);
      }
      else
      {
         let index = students.findIndex(x => x.id == id);
         studentList.push(students[index]);
         students.splice(index, 1);
      }
      this.Students(students);
      this.studentList(studentList);
   }

   public selectStudent(id): void
   {
      this.updateState(id.replace(".", "*"));
   }

   public selectByPerson(person: person): void
   {
      this.selectStudent(person.id);
   }

   public refreshUrlState(): void 
   {
      super.refreshUrlState();

      let state = this.urlState().next();

      if (state)
      {
         if (state == "attendance")
         {
            this.launchBlade(BladeGraph,
            {
               
            });
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
         else
         {
            this.launchBlade(BladeUser, 
            {
               canEdit: false,
               id: state.replace("*", "."),
               minimal: true
            });
         }
      }
   }

   public toggleEdit(): void
   {
      this.isEditing(!this.isEditing());
   }

   public cancel(): void
   {
      this.init();
   }

   public viewAttendace(): void
   {
      this.updateState(STATE_ATTENDANCE);
   }

   public viewAssessments(): void
   {
      this.updateState(STATE_ASSESSMENTS);
   }
}
