import { Injectable } from '@angular/core';
import { defer, Observable, throwError, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { CloudAppRest } from '../../lib/rest';
import { RestResponse, RestErrorResponse } from '../../lib/public-interfaces';
import { RestServiceLogger as logger } from './service-loggers';

export import Request = CloudAppRest.Request;
export import HttpMethod = CloudAppRest.HttpMethod;

@Injectable({
  providedIn: 'root'
})
export class CloudAppRestService {

  constructor() { }

  call(request: string | Request): Observable<any> {
    let req = request;
    if (typeof request === 'string') {
      req = { url: request };
    }
    /* TEMPORARY- calls blocked */
    (<Request>req).queryParams = Object.assign((<Request>req).queryParams || {}, { fromApp: true })

    logger.log('Calling API', req);
    return defer(() => CloudAppRest.call(req as Request)).pipe(
      concatMap(response => {
        if (response.error) {
          logger.log('Response NOT OK', response);
          return throwError(new RestError().fromHttpError(response.error));
        }
        logger.log('Response OK', response);
        return of(response.body as RestResponse);
      })
    );
  }

}

class RestError implements RestErrorResponse {
  ok: boolean;
  status: any;
  statusText: string;
  message: string;
  error: any;

  fromHttpError(e: HttpErrorResponse) {
    Object.assign(this, { ...e });
    if (e.error) {
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