import { Blade, BladeSize } from '../../components/app-blade/blade';
import { IBladePackage } from '../../components/app-blades/app-blades';

import * as html from './blade-notice.html';
import './blade-notice.css';
import { TechboardApi, IUTC, INotice } from '../../common/api/techboard-api';
import { AppMessages, MessageType } from '../../components/app-messages/app-messages';
import { ErrorUtils } from '../../common/utils/error-utils';
import { Slide } from '../blade-noticeboard/blade-noticeboard';
import { GlobalCommunications } from '../../global-communications';

export interface IBladeNoticeParams extends IBladePackage {
   notice?: KnockoutObservable<INotice>;

   onsave?: (notice: INotice) => void;
   ondelete?: () => void;
}

const DEFAULT_BACKGROUND_COLOR = "rgb(192, 192, 192)";
const DEFAULT_TEXT_COLOR = "black";

// represents a single notice record
export class BladeNotice extends Blade<IBladeNoticeParams>
{
   public techApi: TechboardApi = new TechboardApi();
   public notice: KnockoutObservable<INotice> = ko.observable(null);

   public ID: KnockoutObservable<number> = ko.observable(null);
   public CreatedByUserID: KnockoutObservable<string> = ko.observable(null);
   public Image: KnockoutObservable<string> = ko.observable(null);
   public Text: KnockoutObservable<string> = ko.observable(null);
   public SubText: KnockoutObservable<string> = ko.observable(null);
   public Active: KnockoutObservable<boolean> = ko.observable(null);

   public BackgroundColor: KnockoutObservable<string> = ko.observable(DEFAULT_BACKGROUND_COLOR);
   public TextColor: KnockoutObservable<string> = ko.observable(DEFAULT_TEXT_COLOR);
   public SubTextColor: KnockoutObservable<string> = ko.observable(DEFAULT_TEXT_COLOR);

   public isLoading: KnockoutObservable<boolean> = ko.observable(false);
   public previewSlide: KnockoutObservable<Slide[]> = ko.observable([]);

   private _onsave?: (notice: INotice) => void;
   private _ondelete?: () => void;

   public canEdit: KnockoutObservable<boolean> = GlobalCommunications.isAdmin;
   public state: KnockoutObservable<string> = ko.observable("a");


   constructor() {
      super();

      this.html = html;
      this.size(BladeSize.Medium);
      this.title("Notice");

      this.addDisposable
         (
            this.notice.subscribe((value) => {
               this.init();
            })
         );

      this.addDisposable
         (
            this.BackgroundColor.subscribe((value) => {
               let slide = this.previewSlide()[0];
               slide.backgroundColor = value;
               this.previewSlide([slide]);
            })
         );

      this.addDisposable
         (
            this.Text.subscribe((value) => {
               let slide = this.previewSlide()[0];
               slide.text = value;
               this.previewSlide([slide]);
            })
         );

      this.addDisposable
         (
            this.TextColor.subscribe((value) => {
               let slide = this.previewSlide()[0];
               slide.textColor = value;
               this.previewSlide([slide]);
            })
         );

      this.addDisposable
         (
            this.SubText.subscribe((value) => {
               let slide = this.previewSlide()[0];
               slide.subtext = value;
               this.previewSlide([slide]);
            })
         );

      this.addDisposable
         (
            this.SubTextColor.subscribe((value) => {
               let slide = this.previewSlide()[0];
               slide.subtextColor = value;
               this.previewSlide([slide]);
            })
         );
   }

   public dispose(): void {
      super.dispose();
   }

   public async refreshBlade(params?: IBladeNoticeParams) {
      super.refreshBlade(params);

      if (params.notice != null) {
         this.notice = params.notice;
      }
      else {
         this.notice(null);
      }

      this._onsave = params.onsave;
      this._ondelete = params.ondelete;

      this.init();
   }

   public async init(): Promise<void> {
      let slide: Slide =
      {
         path: null,
         backgroundColor: DEFAULT_BACKGROUND_COLOR,
         text: null,
         textColor: DEFAULT_TEXT_COLOR,
         subtext: null,
         subtextColor: DEFAULT_TEXT_COLOR
      }
      this.previewSlide([slide]);

      if (this.notice() == null) {
         this.title("New Notice");

         this.ID(null);
         this.CreatedByUserID(null);
         this.Image(null);
         this.Text(null);
         this.SubText(null);

         this.BackgroundColor(DEFAULT_BACKGROUND_COLOR);
         this.TextColor(DEFAULT_TEXT_COLOR);
         this.SubTextColor(DEFAULT_TEXT_COLOR);
      }
      else{
         this.title("Notice")

         this.ID(this.notice().ID);
         this.CreatedByUserID(this.notice().CreatedByUserID);
         this.Image(this.notice().Image);
         this.Text(this.notice().Text);
         this.SubText(this.notice().SubText);

         if (this.notice().Styling != null) {
            let contents = JSON.parse(this.notice().Styling);
            this.BackgroundColor(contents['BackgroundColor'] != null ? contents['BackgroundColor'] : DEFAULT_BACKGROUND_COLOR);
            this.TextColor(contents['TextColor']);
            this.SubTextColor(contents['SubtextColor']);

            slide.backgroundColor = this.BackgroundColor();
            slide.textColor = this.TextColor();
            slide.subtextColor = this.SubTextColor();
         }

         if (this.Image() != null) {
            slide.path = await this.techApi.getFileURL(this.Image());
         }
         slide.text = this.Text();
         slide.subtext = this.SubText();
      }

      this.previewSlide(null);
      this.previewSlide([slide]);
   }

   public async save(): Promise<void> {
      if (this.isLoading()) {
         return;
      }

      let contents =
      {
         BackgroundColor: this.BackgroundColor(),
         TextColor: this.TextColor(),
         SubtextColor: this.SubTextColor()
      }

      let notice: INotice =
      {
         ID: this.ID(),
         "CreatedByUserID": this.CreatedByUserID(),
         Image: this.Image(),
         Text: this.Text(),
         SubText: this.SubText(),
         Styling: JSON.stringify(contents),
         Active: this.Active()
      };

      try {
         this.isLoading(true);

         if (notice.ID == null) {
            notice = await this.techApi.postNewNotice(notice);
         }
         else {
            notice = await this.techApi.postUpdateNotice(notice.ID, notice);
         }
         this.notice(notice);

         AppMessages.showMessage({ type: MessageType.Success, text: 'Notice successfully saved' });
         if (this._onsave) {
            this._onsave(notice);
         }

      }
      catch (error) {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });
      }
      finally {
         this.isLoading(false);
      }

      this.init();
   }

   public async remove(): Promise<void> {
      if (this.isLoading()) {
         return;
      }

      try {
         this.isLoading(true);

         await this.techApi.deleteNoticeById(this.notice().ID);

         AppMessages.showMessage({ type: MessageType.Success, text: 'Notice successfully removed' });
         if (this._ondelete) {
            this._ondelete();
         }

         this.close();
      }
      catch (error) {
         AppMessages.showMessage({ type: MessageType.Error, text: ErrorUtils.getMessage(error) });
      }
      finally {
         this.isLoading(false);
      }
   }

   public imageUpload(): void {
      try {
         (<any>window).fileDialog({ multiple: false, accept: 'image/*' }, files => {
            this.importImage(files);
         });
      }
      catch (error) {
         console.log(error);
      }
   }

   public async importImage(files: any): Promise<void> {
      try {
         let file = await this.techApi.uploadFile(files[0]);
         this.Image(file.ID);

         let slide = this.previewSlide()[0];
         slide.path = await this.techApi.getFileURL(file.ID);
         this.previewSlide([slide]);
      }
      catch (error) {
         console.log(error);
      }
   }

   public changeState(state: string): void {
      if (this.state() == state) {
         this.state(null)
      }
      else {
         this.state(state)
      }
   }

   // applies values to change current visible notice without affecting record so revert is available
   public changePreset(preset: string): void
   {
      if(preset == "1")
      {
         this.BackgroundColor("rgba(201 , 201, 255, 0.71)");
         this.SubText("Place Subtext Here");
         this.Text("Place Text Here");
         this.TextColor("Black");
         this.SubTextColor("Black");

         this.previewSlide()[0].path = "";

         let previewSlide = this.previewSlide();
         this.previewSlide([]);
         this.previewSlide(previewSlide);
      }
      else if(preset == "2")
      {
         this.BackgroundColor("rgba(255, 189, 189, 0.71)");
         this.SubText("Place Subtext Here");
         this.Text("Place Text Here");
         this.TextColor("White");
         this.SubTextColor("rgb(250, 250, 250)");

         this.previewSlide()[0].path = "";

         let previewSlide = this.previewSlide();
         this.previewSlide([]);
         this.previewSlide(previewSlide);
      }
      else if (preset == "3")
      {
         this.BackgroundColor("rgb(225, 247, 213)");
         this.SubText("Place Subtext Here");
         this.Text("Place Text Here");
         this.TextColor("rgb(0, 10, 46)");
         this.SubTextColor("rgb(0, 10, 46)");

         this.previewSlide()[0].path = "";

         let previewSlide = this.previewSlide();
         this.previewSlide([]);
         this.previewSlide(previewSlide);
      }
   }

   // call init to use record to apply values
   public revert(): void
   {
      this.init();
   }
}
