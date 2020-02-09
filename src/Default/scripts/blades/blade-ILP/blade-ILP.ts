import { Blade, BladeSize } from '../../components/app-blade/blade';

import * as html from './blade-ILP.html';
import './blade-ILP.less';
import { TechboardApi } from '../../common/api/techboard-api';

export interface IBladeILPParams 
{
}

// to do: represents a single ILP record
export class BladeILP extends Blade<IBladeILPParams> 
{
   public techboardApi: TechboardApi = new TechboardApi();

   constructor() 
   {
      super();

      this.html = html;
      this.title('ILP');
      this.size(BladeSize.Medium);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params: IBladeILPParams) 
   {
      super.refreshBlade(params);
   }
}
