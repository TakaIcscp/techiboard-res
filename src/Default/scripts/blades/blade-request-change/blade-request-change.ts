import { Blade, BladeSize } from '../../components/app-blade/blade';

import * as html from './blade-request-change.html';
import './blade-request-change.less';
import { TechboardApi } from '../../common/api/techboard-api';

export interface IBladeRequestChangeParams 
{
}

// to do: represents the process on requesting personal information changes
export class BladeRequestChange extends Blade<IBladeRequestChangeParams> 
{
   public techboardApi: TechboardApi = new TechboardApi();

   constructor() 
   {
      super();

      this.html = html;
      this.title('Request Change');
      this.size(BladeSize.Medium);
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params: IBladeRequestChangeParams) 
   {
      super.refreshBlade(params);
   }
}
