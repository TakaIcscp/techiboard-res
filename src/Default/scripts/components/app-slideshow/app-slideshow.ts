import { AbstractComponent, IAbstractComponentParams, Component } from '../../common/decorator/component';

import * as html from './app-slideshow.html';
import './app-slideshow.css';
import { Slide } from '../../blades/blade-noticeboard/blade-noticeboard';
import { GlobalCommunications } from '../../global-communications';

export interface IAppSlideshowParams extends IAbstractComponentParams 
{
    slides: KnockoutObservable<Slide[]>;
    paused: KnockoutObservable<boolean>;
    preview?: boolean;
}

@Component({ name: 'app-slideshow', template: html })
export class IAppSlideshow extends AbstractComponent<IAppSlideshowParams> 
{
    public intervalHandler: any = null;
    public currentIndex: KnockoutObservable<number> = ko.observable(0);
    public currentSlide: KnockoutObservable<Slide> = ko.observable(null);
    public slides: KnockoutObservable<Slide[]> = ko.observable([]);
    public paused: KnockoutObservable<boolean> = ko.observable(false);
    public preview: KnockoutObservable<boolean> = ko.observable(false);
    public isMobile: KnockoutObservable<boolean> = GlobalCommunications.isMobile;

   constructor(params: IAppSlideshowParams) 
   {
      super(params);

      if (params.paused != null)
      {
        this.paused = params.paused;
      }
      this.slides = params.slides;

      if (params.preview != null)
      {
          this.preview(params.preview);
      }

      let This = this;
      this.addDisposable
      (
          this.slides.subscribe((value) => 
          {
            if (value != null)
            {
                This.resetInterval();
            }

            This.defaultCheck();
          })
      );

      this.defaultCheck();
   }

   public defaultCheck(): void
   {
        if (this.slides == null || this.slides() == null || this.slides().length <= 0 && !this.preview)
        {
            this.currentSlide
            ({
                text: "No notices!",
                subtext: "check back later"
            });
        }
   }

   public resetInterval(): void
   {
        if (this.intervalHandler != null)
        {
            clearInterval(this.intervalHandler);
            this.intervalHandler = null;
        }

        this.intervalHandler = setInterval(() => 
        {
            if (<any>this.paused == false || !this.paused())
            {
                this.cycleSlides()
            }
        }, 5000);

        this.currentSlide(this.slides()[this.currentIndex()]);
   }

    public cycleSlides(): void 
    {
        if (this.slides != null && this.slides() != null && this.slides().length >= 0)
        {
            let currentIndex = this.currentIndex();
            if (currentIndex >= this.slides().length - 1)
            {
                currentIndex = 0;
            }
            else
            {
                currentIndex += 1;
            }
            this.currentIndex(currentIndex);
            this.currentSlide(this.slides()[this.currentIndex()]);
        }
    };

   public dispose(): void 
   {
      super.dispose();

      clearInterval(this.intervalHandler);
   }

    public changeIndex(slide)
    {
        this.resetInterval();
        let index = this.slides().findIndex(x => x == slide);
        this.currentIndex(index);
        this.currentSlide(this.slides()[this.currentIndex()]);
    }

    public togglePause(): void
    {
        this.paused(!this.paused());
    }
}