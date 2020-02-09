import { AbstractComponent, IAbstractComponentParams, Component } from './../../common/decorator/component';
import { ObjectUtils } from '../../common/utils/object-utils';
import { DropDownPosition } from '../app-dropdown/app-dropdown';

import * as html from './app-color-picker.html';
import './app-color-picker.css';

const DEFAULT_COLOR = 'rgb(120,120,120)';

export interface IAppColorPickerParams extends IAbstractComponentParams {
   isOpened: KnockoutObservable<boolean>;
   isReadonly: KnockoutObservable<boolean> | KnockoutComputed<boolean>;
   value: KnockoutObservable<string>;
}

@Component({ name: 'app-color-picker', template: html })
export class AppColorPicker extends AbstractComponent<IAppColorPickerParams> {
   public pickerElement: HTMLElement;
   public isOpened: KnockoutObservable<boolean>;
   public isReadonly: KnockoutObservable<boolean> | KnockoutComputed<boolean>;
   public value: KnockoutObservable<string>;

   public get DropDownPosition(): typeof DropDownPosition {
      return DropDownPosition;
   }

   constructor(params: IAppColorPickerParams) {
      super(params);

      this.isOpened = ObjectUtils.wrap(params.isOpened, false);
      this.isReadonly = ObjectUtils.wrap(params.isReadonly, false);
      this.value = ObjectUtils.wrap(params.value, DEFAULT_COLOR);
   }

   public dispose(): void {
      super.dispose();
   }

   public onrender(element: HTMLElement): void {
      this.pickerElement = element;

      let picker = (window as any).AColorPicker.createPicker(this.pickerElement);
      picker.color = this.value();

      let row = $(this.pickerElement).find('.a-color-picker-rgb');
      let input: HTMLInputElement;
      if (row && row.length) {
         let label = $('<label>A<label>')[0];
         input = $(`<input nameref="A" type="number" maxlength="3" min="0" max="255" value="0">`)[0] as HTMLInputElement;
         input.addEventListener('input', () => {
            let value;

            try {
               value = parseFloat(input.value);
            } catch (e) {
            }

            if (value != null && !isNaN(value)) {
               value = Math.min(Math.max(value, 0), 1);

               if (picker.color) {
                  let rgba = (window as any).AColorPicker.parseColor(picker.color, 'rgba');
                  rgba[3] = value;
                  picker.color = rgba;
               }
            }
         }, false);

         if (picker.color) {
            let rgba = (window as any).AColorPicker.parseColor(picker.color, 'rgba');
            if (input) {
               input.value = rgba[3];
            }
         }

         row[0].appendChild(label);
         row[0].appendChild(input);
      }

      picker.on('change', (picker, color) => {
         this.value(color);

         let rgba = (window as any).AColorPicker.parseColor(color, 'rgba');
         if (input) {
            input.value = rgba[3];
         }
      });
   }

   public close(): void {
      this.isOpened(false);
   }
}
