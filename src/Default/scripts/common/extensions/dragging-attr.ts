import { AbstractAttribute, IAbstractAttributeParams, Attribute } from '../decorator/attribute';

export interface IDraggingAttrParams extends IAbstractAttributeParams {
   ondragstart: () => void;
   ondragend: () => void;
}

const DRAG_TIMEOUT = 1000;

@Attribute({ name: 'dragging-attr' })
export class DraggingAttr extends AbstractAttribute<IDraggingAttrParams> {
   private _ondragover: (event: DragEvent) => void;
   private _ondragend: (event: DragEvent) => void;
   private _ondrop: (event: DragEvent) => void;
   private _timeout: number;
   private _isDragging: boolean = false;

   constructor(params: IDraggingAttrParams) {
      super(params);

      params.element.addEventListener('dragover', this._ondragover = (event: DragEvent) => {
         if (!this._isDragging) {
            this._isDragging = true;
            this.fireDragStart();
         }

         if (this._timeout) {
            clearTimeout(this._timeout);
         }

         this._timeout = setTimeout(() => {
            this.finalize();

         }, DRAG_TIMEOUT);
      }, true);

      params.element.addEventListener('dragend', this._ondragend = (event: DragEvent) => {
         requestAnimationFrame(() => {
            this.finalize();
         });
      }, true);

      params.element.addEventListener('drop', this._ondrop = (event: DragEvent) => {
         requestAnimationFrame(() => {
            this.finalize();
         });
      }, true);
   }

   private finalize(): void {
      if (this._timeout) {
         clearTimeout(this._timeout);
         this._timeout = null;
      }

      if (this._isDragging) {
         this._isDragging = false;
         this.fireDragEnd();
      }
   }

   public dispose(): void {
      if (this._isDragging) {
         this.fireDragEnd();
         this._isDragging = false;
      }

      if (this._ondragover) {
         this.params.element.removeEventListener('dragover', this._ondragover, true);
      }

      if (this._ondragend) {
         this.params.element.removeEventListener('dragend', this._ondragend, true);
      }

      if (this._ondrop) {
         this.params.element.removeEventListener('drop', this._ondrop, true);
      }

      this._ondragover = null;
      this._ondragend = null;
      this._ondrop = null;
   }

   public fireDragStart(): void {
      if (this.params.ondragstart) {
         this.params.ondragstart();
      }
   }

   public fireDragEnd(): void {
      if (this.params.ondragend) {
         this.params.ondragend();
      }
   }
}
