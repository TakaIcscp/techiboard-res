import * as html from './app-messages-message.html';
import './app-messages-message.css';

import { AbstractComponent, IAbstractComponentParams } from '../../../common/decorator/component';
import { Component } from '../../../common/decorator/component';
import { MessageType, IMessage } from "../app-messages";

export interface IAppMessagesMessageParams extends IAbstractComponentParams
{
    message?: IMessage;
    onClose: (message: IMessage) => void;
}

const SHOW_TIME = 8000;

@Component({ name: 'app-messages-message', template: html })
export class AppMessagesMessage extends AbstractComponent<IAppMessagesMessageParams>
{
    public message? : IMessage;
    public onClose: (message: IMessage) => void;

    constructor(params: IAppMessagesMessageParams)
    {
        super(params);
        this.message = params.message;
        this.onClose = params.onClose;
    }
  
    public dispose(): void
    {
        super.dispose();
    }

    /**
     * Reacts to the click of the (x) button. Supposedly removes the message from the view.
     */
    public btCloseClick() : void
    {
        this.onClose(this.message);
    }
}