import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-timetable.html';
import './blade-timetable.css';

export interface IBladeTimetableParams extends IBladePackage 
{

}

// to do: represents a user's personal timetable
export class BladeTimetable extends Blade<IBladeTimetableParams> 
{
   constructor() 
   {
      super();

      this.html = html;
      this.size(BladeSize.Tiny);
      this.isMaximized(true);
      this.title("Timetable");
      this.canMaximize(false);

      /* converting from NZ time to UTC
      let time = new Date();
      console.log(time.toLocaleString());

      let aestTime = time.toLocaleString("en-US", {timeZone: "UTC"});
      console.log(aestTime)
      */
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeTimetableParams) 
   {
      super.refreshBlade(params);
   }
}
