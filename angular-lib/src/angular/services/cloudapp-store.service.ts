import { defer, Observable, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { CloudAppOutgoingEvents } from '../../lib/events/outgoing-events';
import { withErrorChecking } from './service-util';

@Injectable({
  providedIn: 'root'
})
export class CloudAppStoreService {

  constructor() { }

  get(key: string): Observable<any> {
    return withErrorChecking(defer(() => CloudAppOutgoingEvents.store(key))).pipe(
      concatMap(resp=>of(resp.value))
    );
  }

  set(key: string, value: any): Observable<any> {
    return withErrorChecking(defer(() => CloudAppOutgoingEvents.store(key, value)));
  }

  remove(key: string): Observable<any> {
    return withErrorChecking(defer(() => CloudAppOutgoingEvents.store(key, null)));
  }

}
