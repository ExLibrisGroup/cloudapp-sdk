import { defer, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

import { WriteSettingsResponse } from '../../lib/public-interfaces';
import { CloudAppOutgoingEvents } from '../../lib/events/outgoing-events';
import { withErrorChecking } from './service-util';
import { toFormGroup } from './form-group-util';

@Injectable({
  providedIn: 'root'
})
export class CloudAppSettingsService {

  constructor() { }

  get(): Observable<any> {
    return withErrorChecking(defer(() => CloudAppOutgoingEvents.settings()).pipe(
      map(response => JSON.parse(response.settings || '{}'))
    ));
  }

  getAsFormGroup = (): Observable<UntypedFormGroup> => this.get().pipe(map(settings => toFormGroup(settings)));

  set(value: any): Observable<WriteSettingsResponse> {
    return withErrorChecking(defer(() => CloudAppOutgoingEvents.settings(JSON.stringify(value || {}))));
  }

  remove = (): Observable<WriteSettingsResponse> => this.set('');
  
}
