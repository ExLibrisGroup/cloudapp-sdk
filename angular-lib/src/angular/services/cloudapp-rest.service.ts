import { Injectable } from '@angular/core';
import { defer, Observable, throwError, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { CloudAppRest } from '../../lib/rest';
import { RestErrorResponse } from '../../lib/public-interfaces';
import { RestServiceLogger as logger } from './service-loggers';

export type Request = CloudAppRest.Request;
export import HttpMethod = CloudAppRest.HttpMethod;

@Injectable({
  providedIn: 'root'
})
export class CloudAppRestService {

  constructor() { }

  call<T=any>(request: string | Request): Observable<T> {
    const req: Request = typeof request === 'string' ? { url: request } : request;
    req.url = req.url.replace(/^(\/almaws\/v1)/,"");
    logger.log('Calling API', req);
    return defer(() => CloudAppRest.call(req as Request)).pipe(
      concatMap(response => {
        if (response.error) {
          logger.log('Response NOT OK', response);
          return throwError(() => new RestError().fromHttpError(response.error));
        }
        logger.log('Response OK', response);
        return of(response.body as T);
      })
    );
  }

}

class RestError implements RestErrorResponse {

  ok = false;
  status: any;
  statusText = '';
  message = '';
  error: any;

  fromHttpError(e: HttpErrorResponse) {
    Object.assign(this, { ...e });
    if (e.status == 401) {
      this.message = "You are not authorized to perform the requested action.";
    } else if (e.error) {
      const error = e.error;
      if (error.web_service_result) {
        this.message = error.web_service_result.errorList.error.errorMessage
      } else if (error.errorList) {
        this.message = error.errorList.error[0].errorMessage
      }
    }
    return this;
  }

}