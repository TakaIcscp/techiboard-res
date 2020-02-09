import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-student-diploma.html';
import './blade-student-diploma.css';
import { IDiploma, TechboardApi } from '../../common/api/techboard-api';

export interface IBladeStudentDiplomaParams extends IBladePackage 
{
   diplomaID: KnockoutObservable<number>;
}

interface Content
{
   text: KnockoutObservable<string>;
}

// represents the student view of a diploma
export class BladeStudentDiploma extends Blade<IBladeStudentDiplomaParams> 
{
   public techApi: TechboardApi = new TechboardApi();

   public diplomaID: KnockoutObservable<number> = ko.observable(null);
   public isLoading: KnockoutObservable<boolean> = ko.observable(false);

   public Level: KnockoutObservable<number> = ko.observable(null);
   public Title: KnockoutObservable<string> = ko.observable(null);
   public Duration: KnockoutObservable<string> = ko.observable(null);
   public Credits: KnockoutObservable<number> = ko.observable(null);
   public NZQAApproved: KnockoutObservable<boolean> = ko.observable(null);
   public TimeBracketID: KnockoutObservable<number> = ko.observable(null);

   public Legend: KnockoutObservable<string> = ko.observable(null);
   public ContentsList: KnockoutObservable<any> = ko.observable([]);

   public loadedOnce: boolean = false;

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Medium);
      this.title("Diploma");
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeStudentDiplomaParams) 
   {
      super.refreshBlade(params);

      this.diplomaID = params.diplomaID;

      if (!this.loadedOnce)
      {
         this.addDisposable
         (
            this.diplomaID.subscribe((value) => 
            {
               this.init();
            })
         );
         this.loadedOnce = true;
      }

      this.init();
   }

   public async init(): Promise<void>
   {
      let diploma = null;
      if (this.diplomaID() != null && this.diplomaID() != 0)
      {
         diploma = await this.techApi.getDiplomaById(this.diplomaID());
      }

      if (diploma == null)
      {
         this.title("No Diploma");
         this.Level(null);
         this.Title(null);
         this.Duration(null);
         this.ContentsList([]);
         this.Legend(null);
         this.Credits(null);
         this.NZQAApproved(null);
      }
      else
      {
         this.title("Level " + diploma.Level + " " + diploma.Title);
         this.Level(diploma.Level);
         this.Title(diploma.Title);
   
         let duration: number = diploma.Duration;
         if (duration >= 12)
         {
            this.Duration(duration == 12 ? '1 Year' : duration/12 + " Years");
         }
         else
         {
            this.Duration(duration + " Months");
         }
   
         if (diploma.Contents != null)
         {
            let contents = JSON.parse(diploma.Contents);
            let details: string[] = contents['Details'];
            this.ContentsList(details);
            this.Legend(contents['Legend']);
         }
         else
         {
            this.ContentsList([]);
         }
   
         this.Credits(diploma.Credits);
         this.NZQAApproved(diploma.NZQAApproved);
      }
   }
}
