import { AbstractComponent, IAbstractComponentParams, Component } from '../../common/decorator/component';

import * as html from './app-complex-search.html';
import './app-complex-search.css';

export interface IAppComplexSearchParams extends IAbstractComponentParams 
{
   preTitleTextId?: string; // displayed before text variable id data, not counted when searching
   postTitleTextId?: string;
   textVariableId?: string; // what to display
   idVariableId: string; // what to use as an id

   selected: KnockoutObservable<any>;
   items: KnockoutObservable<any[]>;
   title?: string;

   controls?: IFilterControl[];
   filters?: KnockoutObservable<IFilter[]>;
   fullBorder?: boolean;
   disabled?: KnockoutObservable<boolean>;

   disabledClickEvent?: (any) => void;
}

// what controls appear on the right side of the options and the events called on click
export interface IFilterControl
{
   text: string;
   icon: string;
   fontsize?: number;
   clickEvent?: (id) => void;
}

// what filters appear at the top that affect currently visibile items
export interface IFilter
{   
   unique?: boolean,
   title: string,
   desiredValue: any,
   variableId: string,
   checked: boolean,
   not?: boolean
}

@Component({ name: 'app-complex-search', template: html })
export class AppComplexSearch extends AbstractComponent<IAppComplexSearchParams> 
{
   public searched: KnockoutObservable<string> = ko.observable("");
   public selected: KnockoutObservable<any> = ko.observable(null);
   public title: KnockoutObservable<string> = ko.observable(null);

   public controls: KnockoutObservable<IFilterControl[]> = ko.observable([]);
   public filters: KnockoutObservable<IFilter[]> = ko.observable([]);

   public preTitleTextId: KnockoutObservable<string> = ko.observable('');
   public postTitleTextId: KnockoutObservable<string> = ko.observable('');

   public textId: KnockoutObservable<string> = ko.observable('');
   public idId: KnockoutObservable<string> = ko.observable(null);

   public items: KnockoutObservable<any[]>=  ko.observable([]);
   public visibleItems: KnockoutObservable<any[]>=  ko.observable([]);

   // if the border should only be around items or full box
   public fullBorder: KnockoutObservable<boolean> = ko.observable(false);

   // if you cant cause default events
   public disabled: KnockoutObservable<boolean> = ko.observable(false);

   public hoveredControlText: KnockoutObservable<string> = ko.observable(null);

   // event that fires when disabled, useful for non editing classes to open user blades
   private _disabledClickEvent?: (any) => void;

   constructor(params: IAppComplexSearchParams) 
   {
      super(params);

      if (params.fullBorder != null)
      {
         this.fullBorder(params.fullBorder);
      }
      if (params.disabled != null)
      {
         this.disabled = params.disabled;
      }

      this.title(params.title);
      this.selected = params.selected;

      this.idId(params.idVariableId);

      if (params.textVariableId != null)
      {
         this.textId(params.textVariableId);
      }
      if (params.preTitleTextId != null)
      {
         this.preTitleTextId(params.preTitleTextId);
      }
      if (params.postTitleTextId != null)
      {
         this.postTitleTextId(params.postTitleTextId);
      }
      if (params.controls != null)
      {
         this.controls(params.controls);
      }
      if (params.filters != null)
      {
         this.filters(params.filters());
      }
      if (params.items != null)
      {
         this.items = params.items;
         this.visibleItems = params.items;
      }

      this._disabledClickEvent = params.disabledClickEvent;
      
      this.addDisposable
      (
         this.searched.subscribe((value) => 
         {
            this.filterSearch(value);
         })
      );

      this.addDisposable
      (
         this.items.subscribe(() =>
         {
            this.unsetHoveredText();
         })
      );

      this.filterSearch('');
   }

   public dispose(): void 
   {
      super.dispose();
   }

   public itemClicked(item: any): void 
   {
      if (this.selected != null && !this.disabled())
      {
         this.selected(item);
      }
      else if (this.disabled() && this._disabledClickEvent != null)
      {
         this._disabledClickEvent(item);
      }
      this.unsetHoveredText();
   }

   public filterChange(filter: IFilter): void
   {
      let filters = this.filters();

      let orgValue = filter.checked;
      if (filter.unique)
      {
         filters.forEach((f) =>
         {
            if (f.variableId == filter.variableId)
            {
               f.checked = false;
            }
         });
      }
      filter.checked = !orgValue;
      this.filters([]);
      this.filters(filters);

      this.filterSearch(this.searched());
   }

   public filterSearch(text: string): void
   {
      let items = this.items();

      text = text.toLowerCase();

      // loop through every item in list and make sure filter allows it to be visible
      items.forEach((item) =>
      {
         let combined = '';
         if (this.preTitleTextId() != '')
         {
            combined += item[this.preTitleTextId()];
         }
         if (this.textId() != '')
         {
            combined += item[this.textId()];
         }
         if (this.postTitleTextId() != '')
         {
            combined += item[this.postTitleTextId()];
         }

         if (combined.toLowerCase().includes(text) || text == '' || text == null)
         {
            item.isItemVisible = true;
         }
         else
         {
            item.isItemVisible = false;
         }

         if (this.filters().length > 0 && item.isItemVisible)
         {
            let checkedVariableIds: string[] = [];
            this.filters().forEach((filter) =>
            {
               if (filter.checked)
               {
                  if (checkedVariableIds.findIndex(x => x == filter.variableId) == -1)
                  {
                     if (filter.not != null && filter.not == true)
                     {
                        if (item[filter.variableId] != filter.desiredValue)
                        {
                           item.isItemVisible = false;
                        }
                     }
                     else
                     {
                        if (item[filter.variableId] == filter.desiredValue)
                        {
                           item.isItemVisible = false;
                        }
                     }
                  }
                  else
                  {
                     checkedVariableIds.push(filter.variableId);
                  }
               }
            });
         }
      });

      this.items([]);
      this.items(items);
   }

   public setHoveredText(data: IFilterControl): void
   {
      this.hoveredControlText(data.text);
   }

   public unsetHoveredText(): void
   {
      this.hoveredControlText(null);
   }
}
