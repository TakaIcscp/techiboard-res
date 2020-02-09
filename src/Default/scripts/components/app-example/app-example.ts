import { AbstractComponent, IAbstractComponentParams, Component } from '../../common/decorator/component';

import * as html from './app-example.html';
import './app-example.css';

export interface IAppExampleParams extends IAbstractComponentParams {
}

@Component({ name: 'app-example', template: html })
export class AppExample extends AbstractComponent<IAppExampleParams> {
   constructor(params: IAppExampleParams) {
      super(params);
   }

   public dispose(): void {
      super.dispose();
   }
}
