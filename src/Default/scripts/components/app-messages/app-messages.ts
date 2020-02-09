import * as html from './app-messages.html';
import './app-messages.css';

import { AbstractComponent, IAbstractComponentParams } from '../../common/decorator/component';
import { Component } from '../../common/decorator/component';

export interface IAppMessagesParams extends IAbstractComponentParams {
}

// const SHOW_TIME = 8000; 

export enum MessageType
{
   Error = 'error',
   Success = 'success'
}

export interface IMessage
{
   text: string;
   type: MessageType;
}

interface IMessageExtended extends IMessage
{
   id: number;
   timer: number;
}

@Component({ name: 'app-messages', template: html })
export class AppMessages extends AbstractComponent<IAppMessagesParams> {
   protected static messages: KnockoutObservable<IMessageExtended[]> = ko.observable([]);
   private static _ids: number = 0;

   get messages(): IMessageExtended[] {
      return AppMessages.messages();
   }

   get MessageType(): typeof MessageType {
      return MessageType;
   }

   constructor(params: IAppMessagesParams) {
      super(params);
   }

   public dispose(): void {
      super.dispose();
   }

   public static showMessage(message: IMessage): void
   {
      let extendedMessage = { ...message, timer: null, id: AppMessages._ids++ };

      let messages = this.messages();
      messages.push(extendedMessage);
      this.messages(messages);

      /*
      @TODO: This is temporary removed. We need a message to be in collapsed state from which User can recover back to the full view. Message is to be collapsed, not closed by Timer.
      extendedMessage.timer = setTimeout(() =>
      {
         AppMessages.removeMessage(extendedMessage);
      }, SHOW_TIME);
      */
   }

   /**
    * Removes the specified message completely from the view.
    * @param message 
    */
   public static removeMessage(message: IMessageExtended): void
   {
      let messages = AppMessages.messages();
      messages = messages.filter(x => x.id !== message.id);

      AppMessages.messages(messages);
   }

   /**
    * Removes the specified message completely from the view.
    * @param message 
    */
   public removeMessage(message: IMessageExtended): void
   {
      AppMessages.removeMessage(message);
   }

   /**
    * Reacts on User clicking (x) button on one of the message boxes.
    * @param message Message that was in the Messsage Box that was clicked (x).
    */
   public itemCloseClicked(message: IMessageExtended): void
   {
      // alert("Clicked close! Message ID="+message.id);
      this.removeMessage(message);
   }
}
