export class ErrorUtils {
   public static getMessage(error: any): string {
      if (error == null) {
         return null;
      }

      if (typeof error === 'string') {
         return error;
      }

      if (error instanceof Error) {
         return (error).message;
      }

      if (typeof error === 'object') {
         if (error.message) {
            return error.message;
         }

         if (error.Message) {
            return error.Message;
         }
      }

      return error.toString();
   }
}
