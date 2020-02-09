import { Blade, BladeSize } from '../../components/app-blade/blade';

import * as html from './blade-RAP.html';
import './blade-RAP.less';
import { TechboardApi } from '../../common/api/techboard-api';

export interface IBladeRAPParams 
{
}

// to do: represents a single RAP record
export class BladeRAP extends Blade<IBladeRAPParams> 
{
   public techboardApi: TechboardApi = new TechboardApi();

   constructor() 
   {
      super();

      this.html = html;
      this.title('RAP');
      this.size(BladeSize.Medium);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params: IBladeRAPParams) 
   {
      super.refreshBlade(params);
   }
}
