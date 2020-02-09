import { Disposable } from './disposable';

export class UrlState extends Disposable {
   public paths: KnockoutObservable<string[]> = ko.observable([]);

   private static _sharedInstance: UrlState;
   private _startPos: number = 0;
   private _currentPos: number = 0;
   private _parent: UrlState;

   public constructor(parent?: UrlState) {
      super();

      if (parent == null) {
         this.initialize();
         this.addSubscriptions();

      } else {
         this._parent = parent;
         this._startPos = parent._currentPos;
         this._currentPos = parent._currentPos;
         this.paths = parent.paths;
      }
   }

   public mine(): UrlState {
      return new UrlState(this);
   }

   public moveToStart(): void {
      this._currentPos = this._startPos;
   }

   public read(): string {
      if (this._currentPos >= this.paths().length) return null;
      return this.paths()[this._currentPos];
   }

   public next(): string {
      if (this._currentPos >= this.paths().length) return null;
      return this.paths()[this._currentPos++];
   }

   public reset(): void {
      let paths = this.paths();
      if (this._startPos < paths.length) {
         paths = paths.filter((x,index) => index < this._startPos);
      }

      this.paths(paths);
   }

   public update(items: string | string[]): void {
      let paths = this.paths();
      let after = [];
      if (this._startPos < paths.length) {
         after = paths.filter((x,index) => index >= this._currentPos);
         paths = paths.filter((x,index) => index < this._startPos);
      }

      let insertedData = Array.isArray(items) ? items : [items];
      paths.push(...insertedData);
      paths.push(...after);

      this.paths(paths);
   }

   public setState(items: string | string[]): void {
      let paths = this.paths();
      if (this._startPos < paths.length) {
         paths = paths.filter((x,index) => index < this._startPos);
      }

      let insertedData = Array.isArray(items) ? items : [items];
      paths.push(...insertedData);

      this.paths(paths);
   }

   private initialize(): void {
      let refresh = () => {
         let applicationName = new URL($$.Root).pathname || '';
         let path = document.location.pathname.replace(applicationName, '/');

         this.paths(path.split('/').filter(x => x) || []);
      };

      refresh();

      window.onpopstate = () => {
         refresh();
      };
   }

   private addSubscriptions(): void {
      this.addDisposable(
         this.paths.subscribe(x => {
            let url = (x || []).map(x => decodeURI(x)).join('/');
            history.pushState({}, null, $$.Root + url);
         })
      );
   }

   public static sharedInstance(): UrlState {
      return UrlState._sharedInstance || (UrlState._sharedInstance = new UrlState());
   }
}
