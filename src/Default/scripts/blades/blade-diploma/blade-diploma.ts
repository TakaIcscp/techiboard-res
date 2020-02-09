import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-diploma.html';
import './blade-diploma.css';
import { IDiploma, TechboardApi } from '../../common/api/techboard-api';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { ErrorUtils } from '../../common/utils/error-utils';
import { IFilterControl } from '../../components/app-filtered-search/app-filtered-search';

export interface IBladeDiplomaParams extends IBladePackage 
{
   diploma?: KnockoutObservable<IDiploma>;

   onsave?: (diploma: IDiploma) => void;
   ondelete?: () => void;
   onViewAsStudent?: (diplomaId: string) => void;
}

interface Content
{
   text: KnockoutObservable<string>;
}

// represents a single diploma record
export class BladeDiploma extends Blade<IBladeDiplomaParams> 
{
   public techApi: TechboardApi = new TechboardApi();
   public diploma: KnockoutObservable<IDiploma> = ko.observable(null);
   public isLoading: KnockoutObservable<boolean> = ko.observable(false);
   private _onsave?: (diploma: IDiploma) => void;
   private _ondelete?: () => void;
   private _onViewAsStudent?: (diplomaId: string) => void;

   // record details
   public ID: KnockoutObservable<number> = ko.observable(null);
   public Level: KnockoutObservable<number> = ko.observable(null);
   public Title: KnockoutObservable<string> = ko.observable(null);
   public Duration: KnockoutObservable<number> = ko.observable(null);
   public Credits: KnockoutObservable<number> = ko.observable(null);
   public NZQAApproved: KnockoutObservable<boolean> = ko.observable(null);
   public TimeBracketID: KnockoutObservable<number> = ko.observable(null);

   public Legend: KnockoutObservable<string> = ko.observable(null);

   // array of bullet details
   public ContentsList: KnockoutObservable<Content[]> = ko.observable([]);

   public isEditing: KnockoutObservable<boolean> = ko.observable(false);

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Medium);
      this.title("Diploma");

      this.addDisposable(
         this.diploma.subscribe((value) => {
            this.init();
         })
      );
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeDiplomaParams) 
   {
      super.refreshBlade(params);

      if (params.diploma != null)
      {
         this.diploma = params.diploma;
      }
      else
      {
         this.diploma(null);
      }

      this._onsave = params.onsave;
      this._ondelete = params.ondelete;
      this._onViewAsStudent = params.onViewAsStudent;

      this.init();
   }

   public init(): void
   {
      if (this.diploma() == null)
      {
         this.title("New Diploma");
         this.ID(null);
         this.Title(null);
         this.Legend(null);
         this.Level(null);
         this.ContentsList([]);
         this.Duration(0);
         this.NZQAApproved(false);
         this.Credits(0);
         this.TimeBracketID(null);
         this.isEditing(true);
      }
      else
      {
         this.title("Level " + this.diploma().Level + " " + this.diploma().Title);
         this.ID(this.diploma().ID);
         this.Title(this.diploma().Title);
         this.Level(this.diploma().Level);

         if (this.diploma().Contents != null)
         {

            let contents: string[] = JSON.parse(this.diploma().Contents);
            this.Legend(contents['Legend']);
            this.ContentsList((contents['Details']).map(x => {
               return {
                  text: ko.observable(x)
               };
            }));
         }
         else
         {
            this.ContentsList([]);
         }
         
         this.Duration(this.diploma().Duration);
         this.NZQAApproved(this.diploma().NZQAApproved);
         this.Credits(this.diploma().Credits);
         this.TimeBracketID(this.diploma().TimeBracketID);
         this.isEditing(false);
      }
   }

   public async save(): Promise<void>
   {
      if (this.isLoading()) 
      {
         return;
      }

      if (this.Title() == null || this.Title() == "")
      {
         AppMessages.showMessage({ type: MessageType.Error, text: 'Please enter a diploma title!' });
         return;
      }

      let contents = 
      {
         Legend: this.Legend(),
         Details: this.ContentsList().map(x => x.text())
      };

      let diploma: IDiploma = 
      {
         ID: this.ID(),
         Level: this.Level(),
         Title: this.Title(),
         Duration: this.Duration(),
         Credits: this.Credits(),
         NZQAApproved: this.NZQAApproved(),
         Contents: JSON.stringify(contents),
         TimeBracketID: this.TimeBracketID()
      };

      try 
      {
         this.isLoading(true);

         if (diploma.ID == null)
         {
            diploma = await this.techApi.postNewDiploma(diploma);
         }
         else
         {
            diploma = await this.techApi.postUpdateDiploma(diploma.ID, diploma);
         }
         this.diploma(diploma);

         AppMessages.showMessage({ type: MessageType.Success, text: 'Diploma successfully saved' });
         if (this._onsave) 
         {
            this._onsave(diploma);
         }

      } 
      catch (error) 
      {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });
      } 
      finally 
      {
         this.isLoading(false);
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

         await this.techApi.deleteDiplomaById(this.diploma().ID);

         AppMessages.showMessage({ type: MessageType.Success, text: 'Diploma successfully removed' });
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

   public removeContent(content: Content): void 
   {
      let contents = this.ContentsList().filter(x => x !== content);
      this.ContentsList(contents);
   }
   
   public add(): void 
   {
      let contents = this.ContentsList();
      contents.push({ text: ko.observable('') });
      this.ContentsList(contents);
   }

   public toggleEdit(): void
   {
      this.isEditing(!this.isEditing());
   }

   public cancel(): void
   {
      this.isEditing(false);
      this.init();
   }

   public viewAsStudent(): void
   {
      if (this._onViewAsStudent != null && this.ID() != null)
      {
         this._onViewAsStudent(this.ID().toString());
      }
   }
}
