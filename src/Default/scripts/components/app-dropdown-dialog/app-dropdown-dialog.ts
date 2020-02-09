import { AbstractComponent, IAbstractComponentParams, Component } from '../../common/decorator/component';

import * as html from './app-dropdown-dialog.html';
import './app-dropdown-dialog.css';

export interface IAppDropdownDialogParams extends IAbstractComponentParams 
{
    textVariableId?: string;
    items: KnockoutObservable<any[]>;
    clickEvent?: (item) => void;
}

@Component({ name: 'app-dropdown-dialog', template: html })
export class IAppDropdownDialog extends AbstractComponent<IAppDropdownDialogParams> 
{
    public items: KnockoutObservable<any[]> = ko.observable([]);

    public textVariableId: KnockoutObservable<string> = ko.observable('id');
    public contentVisible: KnockoutObservable<boolean> = ko.observable(false);

    private _clickEvent: (item) => void;

    private eventHandler;

    constructor(params: IAppDropdownDialogParams) 
    {
        super(params);

        if (params.items != null)
        {
            this.items = params.items;
        }
        if (params.textVariableId != null)
        {
            this.textVariableId(params.textVariableId);
        }

        window.addEventListener('mouseup', this.eventHandler = (e) =>
        {
            let close = true;

            for (let i = 0; i < e['path'].length; i++)
            {
                let div = e['path'][i];
                if (div.classList != null && div.classList.contains('app-dropdown-dialog'))
                {
                    close = false;
                    break;
                }
            }

            if (close)
            {
                this.contentVisible(false);
            }
        });

        this._clickEvent = params.clickEvent;
    }

    public dispose(): void 
    {
        super.dispose();

        window.removeEventListener('mouseup', this.eventHandler);
    }

    public toggleVisible(): void
    {
        this.contentVisible(!this.contentVisible());
    }

    public itemClick(item): void
    {
        if (this._clickEvent != null)
        {
            this._clickEvent(item);
        }
        this.contentVisible(false);
    }
}