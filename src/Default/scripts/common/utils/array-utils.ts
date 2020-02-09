import { IGroup } from './group';

export class ArrayUtils {
   public static group<T>(source: T[], groupName: (item: T) => any): IGroup<T>[] {
      let previousGroup: IGroup<T> = null;
      let result: IGroup<T>[] = [];

      source.forEach(item => {
         let group = groupName(item);
         if (!previousGroup || previousGroup.groupName !== group) {
            previousGroup = {
               groupName: group,
               items: [item]
            };
            result.push(previousGroup);

         } else {
            previousGroup.items.push(item);
         }
      });

      return result;
   }
}
