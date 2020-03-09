import { defer, Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ReadSettingsResponse, WriteSettingsResponse } from '../../lib/public-interfaces';
import { CloudAppOutgoingEvents } from '../../lib/events/outgoing-events';
import { withErrorChecking } from './service-util';
import { asFormGroup } from './form-group-util';

@Injectable({
  providedIn: 'root'
})
export class CloudAppSettingsService {

  constructor() { }

  get(): Observable<any> {
    return withErrorChecking(defer(() => CloudAppOutgoingEvents.settings()).pipe(
      concatMap(response => of(JSON.parse(response.settings || '{}')))
    ));
  }

  getAsFormGroup = (): Observable<FormGroup> => this.get().pipe(map(settings => asFormGroup(settings) as FormGroup));

  set(value: any): Observable<WriteSettingsResponse> {
    return withErrorChecking(defer(() => CloudAppOutgoingEvents.settings(JSON.stringify(value || {}))));
  }

  remove = (): Observable<WriteSettingsResponse> => this.set('');

}
