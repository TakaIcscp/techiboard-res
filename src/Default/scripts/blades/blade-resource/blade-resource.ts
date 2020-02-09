import { Blade, BladeSize } from '../../components/app-blade/blade';

import * as html from './blade-resource.html';
import './blade-resource.css';
import { TechboardApi, IClientResource } from '../../common/api/techboard-api';
import { IBladePackage } from '../../components/app-blades/app-blades';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { ErrorUtils } from '../../common/utils/error-utils';
import { GlobalCommunications } from '../../global-communications';

export interface IBladeResourceParams extends IBladePackage
{
   type?: string;
   resource?: KnockoutObservable<IClientResource>;

   onsave?: (resource: IClientResource) => void;
   ondelete?: () => void;
}

// represents the creation or viewing of a single resource record
export class BladeResource extends Blade<IBladeResourceParams> 
{
   public techboardApi: TechboardApi = new TechboardApi();

   public resource: KnockoutObservable<IClientResource> = ko.observable(null);

   private _onsave?: (clas: IClientResource) => void;
   private _ondelete?: () => void;

   public ID: KnockoutObservable<number> = ko.observable(null);
   public file: KnockoutObservable<any> = ko.observable(null);
   public resourceID: KnockoutObservable<string> = ko.observable(null);
   public tag: KnockoutObservable<string> = ko.observable(null);
   public description: KnockoutObservable<string> = ko.observable(null);
   public type: KnockoutObservable<string> = ko.observable("general");
   public isPDF: KnockoutObservable<boolean> = ko.observable(false);
   public path: KnockoutObservable<string> = ko.observable(null);

   public isEditing: KnockoutObservable<boolean> = ko.observable(false);
   public isAdmin: KnockoutObservable<boolean> = GlobalCommunications.isAdmin;

   constructor() 
   {
      super();

      this.html = html;
      this.title('Resource');
      this.size(BladeSize.Small);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params: IBladeResourceParams) 
   {
      super.refreshBlade(params);

      if (params.resource != null)
      {
         this.resource = params.resource;
         this.type(params.resource().Type);
      }
      else
      {
         this.resource(null);

         if (params.type != null)
         {
            this.type(params.type);
         }
      }

      this._onsave = params.onsave;
      this._ondelete = params.ondelete;

      this.init();
   }

   public async init(): Promise<void>
   {
      this.isLoading(true);


      if (this.resource() == null)
      {
         this.tag(null);
         this.file(null);
         this.resourceID(null);
         this.ID(null);
         this.path(null);
         this.isPDF(false);
         this.description(null);

         this.title("New Resource");
         this.isEditing(true);
      }
      else
      {
         this.tag(this.resource().Tag);
         this.resourceID(this.resource().ResourceID);
         this.file(null);
         this.ID(this.resource().ID);
         this.description(this.resource().Description);

         let path = await this.techboardApi.getFileURL(this.resourceID());
         let blob = await fetch(path).then(r => r.blob());

         this.isPDF(blob.type == 'application/pdf');
         this.path(path);

         this.title(this.tag());
         this.isEditing(false);
      }

      this.isLoading(false);
   }

   public fileUpload(): void
   {
      try
      {
         (<any>window).fileDialog({ multiple: false, accept: '*' }, files => 
         {
            this.file(files[0]);

            // determines if the file is a pdf or image
            this.isPDF(files[0].type == 'application/pdf');

            this.path(URL.createObjectURL(files[0]));
         });
      }
      catch (error)
      {
         console.log(error);
      }
   }

   public async save(): Promise<void>
   {
      try
      {
         let resID = null;

         if (this.file() != null)
         {
            let file = await this.techboardApi.uploadFile(this.file());
            resID = file.ID;
         }
         else if (this.resourceID() != null)
         {
            resID = this.resourceID();
         }
         else
         {
            AppMessages.showMessage({ type: MessageType.Error, text: "Please upload a file for the resource!" });
            return;
         }

         if (this.tag() == null || this.tag() == '')
         {
            AppMessages.showMessage({ type: MessageType.Error, text: "Please specify a tag for your resource!" });
            return;
         }

         let resource: IClientResource =
         {
            ResourceID: resID,
            Tag: this.tag(),
            Type: this.type(),
            Description: this.description()
         };

         if (this.ID() == null)
         {
            resource = await this.techboardApi.postNewClientResource(resource);
         }
         else
         {
            resource = await this.techboardApi.postUpdateClientResource(this.ID(), resource);
         }

         AppMessages.showMessage({ type: MessageType.Success, text: "New resource uploaded successfully!" });

         this.path(await this.techboardApi.getFileURL(resource.ResourceID));
         this.file(null);
         this.isEditing(false);

         this._onsave(resource);
      }
      catch (error)
      {
         console.log(error);
      }
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

         await this.techboardApi.deleteClientResourceById(this.ID());

         AppMessages.showMessage({ type: MessageType.Success, text: 'Resource successfully removed' });
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
}
