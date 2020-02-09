import { Blade, BladeSize } from '../../components/app-blade/blade';

import * as html from './blade-CV.html';
import './blade-CV.css';
import { TechboardApi } from '../../common/api/techboard-api';

export interface IBladeCVParams 
{
}

// to do: represents a single opened cv
export class BladeCV extends Blade<IBladeCVParams> 
{
   public techboardApi: TechboardApi = new TechboardApi();

   constructor() 
   {
      super();

      this.html = html;
      this.title('CV');
      this.size(BladeSize.Medium);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params: IBladeCVParams) 
   {
      super.refreshBlade(params);
   }
}
