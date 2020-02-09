import { AbstractComponent, IAbstractComponentParams, Component } from '../../common/decorator/component';

import * as html from './app-timetable.html';
import './app-timetable.css';

export interface IAppTimetableParams extends IAbstractComponentParams {
}

@Component({ name: 'app-timetable', template: html })
export class AppTimetable extends AbstractComponent<IAppTimetableParams> {
   constructor(params: IAppTimetableParams) {
      super(params);
   }

   public dispose(): void {
      super.dispose();
   }
}
