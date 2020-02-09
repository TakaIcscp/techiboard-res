import { AbstractComponent, IAbstractComponentParams, Component } from '../../common/decorator/component';

import * as html from './app-error.html';
import './app-error.css';

export interface IAppErrorParams extends IAbstractComponentParams {
}

@Component({ name: 'app-error', template: html })
export class AppError extends AbstractComponent<IAppErrorParams> {
   constructor(params: IAppErrorParams) {
      super(params);
   }

   public dispose(): void {
      super.dispose();
   }
}
