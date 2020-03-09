import { defer, Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ReadConfigResponse, WriteConfigResponse } from '../../lib/public-interfaces';
import { CloudAppOutgoingEvents } from '../../lib/events/outgoing-events';
import { withErrorChecking } from './service-util';
import { asFormGroup } from './form-group-util';

@Injectable({
  providedIn: 'root'
})
export class CloudAppConfigService {

  constructor() { }

  get(): Observable<any> {
    return withErrorChecking(defer(() => CloudAppOutgoingEvents.config()).pipe(
      concatMap(response => of(JSON.parse(response.config || '{}')))
    ));
  }

  getAsFormGroup = (): Observable<FormGroup> => this.get().pipe(map(config => asFormGroup(config) as FormGroup));

  set(value: any): Observable<WriteConfigResponse> {
    return withErrorChecking(defer(() => CloudAppOutgoingEvents.config(JSON.stringify(value || {}))));
  }

  remove = (): Observable<WriteConfigResponse> => this.set('');

}
