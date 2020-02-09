export interface IOffset {
   from: HTMLElement;
   to: HTMLElement;
   left: number;
   top: number;
}

export class HTMLUtils {
   public static getOffset(from: HTMLElement, to: HTMLElement): IOffset {
      let offset = {
         from: from,
         to: to,
         left : from.getBoundingClientRect().left - to.getBoundingClientRect().left,
         top : from.getBoundingClientRect().top - to.getBoundingClientRect().top
      };

      return offset;
   }

   public static getFixedParent(element: HTMLElement): HTMLElement {
      if (!element) return;

      while (element) {
         element = element.parentNode as HTMLElement;
         if (!element || element == document.body) break;

         if (window.getComputedStyle(element).position == 'fixed') return element;
      }

      return document.body;
   }

   public static contains(element: HTMLElement, parent: HTMLElement): boolean {
      if (!element || !parent) return false;

      while (element) {
         if (element === parent) return true;
         element = element.parentNode as HTMLElement;
      }

      return false;
   }
}
