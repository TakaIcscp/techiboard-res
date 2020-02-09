import { AbstractComponent, IAbstractComponentParams, Component } from '../../common/decorator/component';

import * as html from './app-filtered-search.html';
import './app-filtered-search.css';

export interface IAppFilteredSearchParams extends IAbstractComponentParams 
{
   selected: KnockoutObservable<any>;
   items: KnockoutObservable<any[]>;
   title?: string;
   controls?: IFilterControl[];
}

export interface IFilterControl
{
   text: string;
   icon: string;
   fontsize?: number;
   clickEvent?: (id) => void;
}

// old, go to complex filtered search
@Component({ name: 'app-filtered-search', template: html })
export class AppFilteredSearch extends AbstractComponent<IAppFilteredSearchParams> 
{
   public searched: KnockoutObservable<string> = ko.observable("");
   public selected: KnockoutObservable<any> = ko.observable(null);
   public filterId: KnockoutObservable<string> = ko.observable(null);
   public filterId2: KnockoutObservable<string> = ko.observable(null);
   public items: KnockoutObservable<any[]>=  ko.observable([]);
   public title: KnockoutObservable<string> = ko.observable(null);

   public controls: KnockoutObservable<IFilterControl[]> = ko.observable([]);

   constructor(params: IAppFilteredSearchParams) 
   {
      super(params);

      this.selected = params.selected;
      if (params.items != null)
      {
         this.items = params.items;  
      }
      if (params.controls != null)
      {
         this.controls(params.controls);
      }

      this.title(params.title);
      
      let uniqueNum;
      let id;
      let div;
      do
      {
         uniqueNum = Math.floor((Math.random() * 10000) + 1);
         id = "filtereddropdownul" + uniqueNum;
         div = document.getElementById(id);
      }
      while (div != null);
      this.filterId(id);
      this.filterId2(id + "input");
      
      this.addDisposable
      (
         this.searched.subscribe((value) => 
         {
            this.filterSearch(value);
         })
      );
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public itemClicked(item: any): void 
   {
      if (this.selected != null)
      {
         this.selected(item);
      }
   }

   public filterSearch(text: string): void
   {
      let filter = text.toUpperCase();
      let itemsDiv = document.getElementById(this.filterId());
      let items = itemsDiv.getElementsByTagName("div");;

      for (let i = 0; i < items.length; i++) 
      {
          let a = items[i];
          let txtValue = a.innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) 
          {
            items[i].style.display = "";
          } 
          else 
          {
            items[i].style.display = "none";
          }
      }
  }
}
