import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-resources.html';
import './blade-resources.css';
import { TechboardApi, IClientResource } from '../../common/api/techboard-api';
import { BladeResource } from '../blade-resource/blade-resource';
import { Session } from '../../common/utils/session';

export interface IBladeResoucesParams extends IBladePackage 
{

}

const STATE_NEW = 'new';

// represents all recources associated with the resource group
export class BladeResources extends Blade<IBladeResoucesParams> 
{
   public techApi: TechboardApi = new TechboardApi();
   public data: KnockoutObservable<any[]> = ko.observable([]);
   public selectedResource: KnockoutObservable<IClientResource> = ko.observable(null);
   public loading: KnockoutObservable<boolean> = ko.observable(false);

   // the default type is general resources
   public type = "general";

   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Small);
      this.title("Resources");

      this.addDisposable(
      this.selectedResource.subscribe((value) =>
      {
         this.select(value);
      }))
   }

   public async init(): Promise<void>
   {
      this.loading(true);
      try
      {
         let data = await this.techApi.getClientResourceList(this.type);
         this.data(data['ClientResources']);
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
                  this.launchBlade(BladeResource, 
                  {
                     type: this.type,
                     onsave: (newResource: any) => 
                     {
                        this.selectedResource(newResource);
                        this.init();
                     },
                     ondelete: () => 
                     {
                        this.init();
                     }
                  });
                 break;
            default:
                  this.launchBlade(BladeResource, 
                  {
                     resource: this.selectedResource,
                     onsave: () => 
                     {
                        this.init();
                     },
                     ondelete: () => 
                     {
                        this.selectedResource(null);
                        this.init();
                     }
                  });
               break;
         }
      }
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeResoucesParams) 
   {
      super.refreshBlade(params);

      this.type = this.urlState().paths()[0];

      this.init();
   }

   public select(resource: any): void
   {
      if (resource != null)
      {
         this.updateState(resource.ID.toString());
      }
   }  

   public newResource(): void
   {
      this.updateState(STATE_NEW);
      this.selectedResource(null);
   }

   public isAdmin(): boolean
   {
      return Session.isFeatureEnabled('Admin');
   }
}
