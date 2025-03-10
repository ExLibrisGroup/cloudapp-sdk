import { defer, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

import { WriteConfigResponse } from '../../lib/public-interfaces';
import { CloudAppOutgoingEvents } from '../../lib/events/outgoing-events';
import { withErrorChecking } from './service-util';
import { toFormGroup } from './form-group-util';

@Injectable({
  providedIn: 'root'
})
export class CloudAppConfigService {

  constructor() { }

  get(): Observable<any> {
    return withErrorChecking(defer(() => CloudAppOutgoingEvents.config()).pipe(
      map(response => JSON.parse(response.config || '{}'))
    ));
  }

  getAsFormGroup = (): Observable<UntypedFormGroup> => this.get().pipe(map(config => toFormGroup(config)));

  set(value: any): Observable<WriteConfigResponse> {
    return withErrorChecking(defer(() => CloudAppOutgoingEvents.config(JSON.stringify(value || {}))));
  }

  remove = (): Observable<WriteConfigResponse> => this.set('');

}
