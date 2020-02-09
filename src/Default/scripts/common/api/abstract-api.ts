/**
 * Base api
 */
import { ICacheable } from '../utils/cache';
import { Cancellable } from '../utils/cancellable';
import { Cookies } from '../utils/cookies';
import { Cache } from '../utils/cache';

const SESSION_HEADER = 'X-SessionID';
export const SESSION_ID_NAME = 'SSID';

export interface IHttpError {
   message: string;
   code: string;
}

export class AbstractApi implements ICacheable {
   public counter: KnockoutObservable<number> = ko.observable<number>(0);
   public cache = new Cache();
   public sendSessionId: boolean = true;

   constructor() {
   }

   public request<TOutput>(request: JQuery.AjaxSettings, sendSSID: boolean = true): Cancellable<TOutput>
   {
      return new Cancellable((resolve, reject) =>
      {
         let _url = request.url;
         let requestData = Object.assign({}, request,
         {
            headers: this.sendSessionId && sendSSID ?
            {
               ...request.headers,
               [SESSION_HEADER]: Cookies.getCookie(SESSION_ID_NAME) || ''
            }
            : 
            {
               ...request.headers
            },
            success: (response) =>
            {
               this.counter(this.counter() - 1);
               resolve(response);
            },
            error: (jqXHR, errorType) =>
            {
               this.counter(this.counter() - 1);
               if (jqXHR.statusText == 'abort')
               {
                  reject(Cancellable.CANCELED);
               }
               else if (jqXHR.statusText == 'Not Found')
               {
                  reject(_url + " - resource not found (error 404)! Please check Proxi settings and the code making the request. Server Response:"+jqXHR.responseText);
               }
               else
               {
                  // message
                  let msg = null;
                  try
                  {
                     let parsed = JSON.parse(jqXHR.responseText);
                     if (parsed.ERROR)
                     {
                        msg =
                        {
                           message: parsed.ERROR.Message,
                           code: parsed.ERROR.Code
                        };
                     }
                     else 
                     {
                        msg = parsed;
                     }

                  }
                  catch (e)
                  {
                     // msg = 'Failed to make http-request';
                     msg = jqXHR.responseText || 'Failed to make http-request to URL:' + _url;
                  }

                  reject(msg);
               }
            }
         });

         this.counter(this.counter() + 1);

         let xhr = $.ajax(requestData);
         return () => {
            xhr.abort();
         };
      });
   }

   public uploadRequest<TOutput>(url: string,
                                 formData: Document | BodyInit,
                                 progress?: (ev: ProgressEvent) => void): Cancellable<TOutput>
   {
      return new Cancellable((resolve, reject) => 
      {
         this.counter(this.counter() + 1);
         let _url = url;
         let xhr = new XMLHttpRequest();
         let ssid = Cookies.getCookie(SESSION_ID_NAME);

         if (progress)
         {
            if (xhr.upload) xhr.upload.onprogress = progress;
            else xhr.addEventListener('progress', progress);
         }

         xhr.onreadystatechange = (e) => 
         {
            if (xhr.readyState == 4)
            {
               this.counter(this.counter() - 1);

               if (xhr.status >= 400)
               {
                  let msg = null;
                  try
                  {
                     let parsed = JSON.parse(xhr.responseText);
                     if (parsed.ERROR)
                     {
                        msg =
                        {
                           message: parsed.ERROR.Message,
                           code: parsed.ERROR.Code
                        };
                     }
                     else
                     {
                        msg = parsed;
                     }

                  }
                  catch (e)
                  {
                     // msg = 'Failed to make http-request';
                     msg = xhr.responseText || 'Failed to make http-request to URL:' + _url;
                  }

                  reject(msg);
                  return;
               }

               let json;
               try
               {
                  json = JSON.parse(xhr.responseText);
                  resolve(json);
               }
               catch (e)
               {
                  reject('Failed to parse the response received from the server! Error:' + e);
                  return;
               }
            }
         };

         xhr.open('POST', url, true);
         if (ssid) {
            xhr.setRequestHeader(SESSION_HEADER, ssid);
         }

         xhr.send(formData);
      });
   }

   public downloadRequest(url: string, filename: string, mimitype: string): Cancellable<void>
   {
      return new Cancellable((resolve, reject) =>
      {
         this.counter(this.counter() + 1);
         let _url = url;
         let xhr = new XMLHttpRequest();
         xhr.open('GET', url, true);
         xhr.responseType = 'blob';
         xhr.onreadystatechange = (e) =>
         {
            if (xhr.status >= 400)
            {
               this.counter(this.counter() - 1);

               let msg = null;
               try
               {
                  let parsed = JSON.parse(xhr.responseText);
                  if (parsed.ERROR)
                  {
                     msg =
                     {
                        message: parsed.ERROR.Message,
                        code: parsed.ERROR.Code
                     };
                  }
                  else
                  {
                     msg = parsed;
                  }
               }
               catch (e)
               {
                  // msg = 'Failed to make http-request';
                  msg = xhr.responseText || 'Failed to make http-request to URL:' + _url;
               }

               reject(msg);
               return;
            }

            if (xhr.readyState == 4) 
            {
               this.counter(this.counter() - 1);
               let data = xhr.response;
               (window as any).download(data, filename, mimitype);
               resolve(xhr.response);
            }
         };

         xhr.send();
      });
   }

   public downloadPostRequest<T>(url: string, data: T, filename: string, mimitype: string): Cancellable<void>
   {
      return new Cancellable((resolve, reject) =>
      {
         this.counter(this.counter() + 1);
         let _url = url;
         let xhr = new XMLHttpRequest();
         xhr.open('POST', url, true);
         xhr.responseType = 'blob';
         xhr.onreadystatechange = (e) =>
         {
            if (xhr.status >= 400)
            {
               this.counter(this.counter() - 1);

               let msg = null;
               try
               {
                  let parsed = JSON.parse(xhr.responseText);
                  if (parsed.ERROR)
                  {
                     msg =
                     {
                        message: parsed.ERROR.Message,
                        code: parsed.ERROR.Code
                     };
                  }
                  else
                  {
                     msg = parsed;
                  }
               }
               catch (e)
               {
                  // msg = 'Failed to make http-request';
                  msg = xhr.responseText || 'Failed to make http-request to URL:' + _url;
               }

               reject(msg);
               return;
            }

            if (xhr.readyState == 4)
            {
               this.counter(this.counter() - 1);
               let data = xhr.response;
               (window as any).download(data, filename, mimitype);
               resolve(xhr.response);
            }
         };

         xhr.send(JSON.stringify(data || {}));
      });
   }
}
