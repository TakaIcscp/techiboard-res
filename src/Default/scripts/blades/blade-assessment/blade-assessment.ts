import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-assessment.html';
import './blade-assessment.css';
import { IClass, TechboardApi, IUTC, IDiploma, IClassProfileLink, IAssessment, IAssessmentProfileLink } from '../../common/api/techboard-api';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { ErrorUtils } from '../../common/utils/error-utils';
import { IFilterControl } from '../../components/app-filtered-search/app-filtered-search';
import { BladeUser } from '../blade-user/blade-user';
import { BladeGraph } from '../blade-graph/blade-graph';
import { BladeAssessments } from '../blade-assessments/blade-assessments';
import { person } from '../blade-class/blade-class';
import { GlobalCommunications } from '../../global-communications';

export interface IBladeAssessmentParams extends IBladePackage 
{
   classID: KnockoutObservable<number>;
   assessment?: KnockoutObservable<IAssessment>;
   students?: KnockoutObservable<person[]>;

   onsave?: (assessment: IAssessment) => void;
   ondelete?: () => void;
}

// represents a student assessment formatted to have knockout observable links
interface StudentAssessmentGrade
{
   orgID: number;
   ID?: string;
   Marks: KnockoutObservable<number>;
   LetterMark: KnockoutObservable<string>;
   Passed: KnockoutObservable<boolean>;
   ResitDate: KnockoutObservable<string>;
   ResitCompleted: KnockoutObservable<boolean>;
   noResit: KnockoutObservable<boolean>;
}

// represents a copy of a single assessment record and related grades
export class BladeAssessment extends Blade<IBladeAssessmentParams> 
{
   public techApi: TechboardApi = new TechboardApi();
   public assessment: KnockoutObservable<IAssessment> = ko.observable(null);

   public ID: KnockoutObservable<number> = ko.observable(null);
   public Tag: KnockoutObservable<string> = ko.observable(null);
   public ClassID: KnockoutObservable<number> = ko.observable(null);
   public Date: KnockoutObservable<IUTC> = ko.observable(null);
   public PickingDate: KnockoutObservable<string> = ko.observable();

   // ko observable links, populated through assessment grades
   public links: KnockoutObservable<StudentAssessmentGrade[]> = ko.observable([]);

   public current: string = "";
   public isLoading: KnockoutObservable<boolean> = ko.observable(false);
   public isLoadingGrades: KnockoutObservable<boolean> = ko.observable(false);
   public students: KnockoutObservable<person[]> = ko.observable([]);

   public isEditing: KnockoutObservable<boolean> = ko.observable(false);
   private _onsave?: (assessment: IAssessment) => void;
   private _ondelete?: () => void;

   public canEdit: KnockoutObservable<boolean> = ko.observable(false);

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Big);
      this.title("Assessment");

      this.addDisposable
      (
         this.assessment.subscribe((value) => 
         {
            this.init();
         })
      );

      // if students change reformat links we it means a new class was selected
      this.addDisposable
      (
         this.students.subscribe((students) =>
         {
            this.formatLinks();
         })
      );

      this.canEdit(GlobalCommunications.isTeacher() || GlobalCommunications.isAdmin());
   }

   // create a ko observable array from link records related to current students and assessment
   private async formatLinks(): Promise<void>
   {
      let links = [];

      if (this.students == null || this.students() == null)
      {
         this.links([]);
         return;
      }

      this.isLoadingGrades(true);

      if (GlobalCommunications.isTeacher() || GlobalCommunications.isAdmin())
      {
         for (let i = 0; i < this.students().length; i++)
         {
            let student = this.students()[i];
   
            let link: IAssessmentProfileLink = await this.techApi.getAssessmentLinkByID(this.assessment().ID, student.id);
   
            if (link['OK'] == true)
            {
               link = null;
            }

            let resitDate = null;
            if (link != null && link.ResitDate != null)
            {
               let wrapNumber = (num): string =>
               {
                  if (num < 10)
                  {
                     return "0" + num;
                  }
                  return num;
               };

               resitDate = wrapNumber(link.ResitDate.y) + "-" + wrapNumber(link.ResitDate.m) + "-" + wrapNumber(link.ResitDate.d)
            }
   
            links.push
            (
               {
                  orgID: link == null ? null : link.ID,
                  ID: student.id,
                  Marks: ko.observable(link == null ? null : link.Marks),
                  LetterMark: ko.observable(link == null ? null : link.LetterMark),
                  Passed: ko.observable(link == null ? null : link.Passed),
                  ResitDate: ko.observable(resitDate),
                  ResitCompleted: ko.observable(link == null ? null : link.ResitCompleted),
                  noResit: ko.observable(resitDate == null ? true : false)
               }
            )
         }
      }
      else
      {
         let link: IAssessmentProfileLink = await this.techApi.getAssessmentLinkByID(this.assessment().ID, $$.Session.User.ID);
   
         if (link['OK'] == true)
         {
            link = null;
         }

         let resitDate = null;
         if (link != null && link.ResitDate != null)
         {
            let wrapNumber = (num): string =>
            {
               if (num < 10)
               {
                  return "0" + num;
               }
               return num;
            };

            resitDate = wrapNumber(link.ResitDate.y) + "-" + wrapNumber(link.ResitDate.m) + "-" + wrapNumber(link.ResitDate.d)
         }

         links.push
         (
            {
               orgID: link == null ? null : link.ID,
               ID: $$.Session.User.ID,
               Marks: ko.observable(link == null ? null : link.Marks),
               LetterMark: ko.observable(link == null ? null : link.LetterMark),
               Passed: ko.observable(link == null ? null : link.Passed),
               ResitDate: ko.observable(resitDate),
               ResitCompleted: ko.observable(link == null ? null : link.ResitCompleted),
               noResit: ko.observable(resitDate == null ? true : false)
            }
         )
      }

      this.isLoadingGrades(false);

      this.links([]);
      this.links(links);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeAssessmentParams) 
   {
      super.refreshBlade(params);

      if (params.assessment != null)
      {
         this.assessment = params.assessment;
      }
      else
      {
         this.assessment(null);
      }

      this.ClassID = params.classID;
      this.students = params.students;

      this._onsave = params.onsave;
      this._ondelete = params.ondelete;

      this.init();
   }

   public async init(): Promise<void>
   {
      this.isLoading(true);

      let assessment = this.assessment();

      let wrapNumber = (num): string =>
      {
         if (num < 10)
         {
            return "0" + num;
         }
         return num;
      };

      if (assessment == null)
      {
         this.title("New Assessment");

         this.ID(null);
         this.Tag(null);
         this.Date(null);
         let today = new Date();

         let PickingDate = wrapNumber(today.getFullYear()) + "-" + wrapNumber(today.getMonth()) + "-" + wrapNumber(today.getDate())
         this.PickingDate(PickingDate);

         this.isEditing(true);
      }
      else
      {
         this.ID(assessment.ID);
         this.Tag(assessment.Tag);
         this.Date(assessment.Date);

         let PickingDate = wrapNumber(assessment.Date.y) + "-" + wrapNumber(assessment.Date.m) + "-" + wrapNumber(assessment.Date.d)
         this.PickingDate(PickingDate);

         this.title(this.Tag());
         this.isEditing(false);
      }

      this.isLoading(false);
      this.formatLinks();
   }

   public async save(): Promise<void>
   {
      if (this.isLoading()) 
      {
         return;
      }

      if (this.Tag() == null || this.Tag() == "")
      {
         AppMessages.showMessage({ type: MessageType.Error, text: 'Please enter an assessment tag!' });
         return;
      }

      let date: string[] = this.PickingDate().split("-");

      let assessment: IAssessment = 
      {
         ID: this.ID(),
         Tag: this.Tag(),
         ClassID: this.ClassID(),
         Date: 
         {
            d: parseInt(date[2]),
            hh: 0,
            m: parseInt(date[1]),
            mm: 0,
            ss: 0,
            y: parseInt(date[0])
         }
      };

      if (this.ID() != null && this.ID() != 0)
      {
         for (let i = 0; i < this.links().length; i++)
         {
            let link = this.links()[i];
            let date: string[] = this.PickingDate().split("-");

            let newRecordLink: IAssessmentProfileLink =
            {
               ID: link.orgID,
               AssessmentID: this.assessment().ID,
               LetterMark: link.LetterMark(),
               Marks: link.Marks() != null ? link.Marks().toString() : null,
               Passed: link.Passed(),
               ProfileID: link.ID,
               ResitCompleted: link.ResitCompleted(),
               ResitDate: link.noResit() ? null :
               {
                  d: parseInt(date[2]),
                  hh: 0,
                  m: parseInt(date[1]),
                  mm: 0,
                  ss: 0,
                  y: parseInt(date[0])
               }
            };

            await this.techApi.postAssessmentProfileLink(this.assessment().ID, link.ID, newRecordLink);
         }
      }

      try 
      {
         this.isLoading(true);

         if (assessment.ID == null)
         {
            assessment = await this.techApi.postNewAssessment(assessment);
         }
         else
         {
            assessment = await this.techApi.postUpdateAssessment(assessment.ID, assessment);
         }

         AppMessages.showMessage({ type: MessageType.Success, text: 'Assessment successfully saved' });
         if (this._onsave) 
         {
            this._onsave(assessment);
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

   public toggleEdit(): void
   {
      this.isEditing(!this.isEditing());
   }

   public cancel(): void
   {
      this.init();
   }

   public toggleResit(link: StudentAssessmentGrade): void
   {
      link.noResit(!link.noResit());
   }
}
