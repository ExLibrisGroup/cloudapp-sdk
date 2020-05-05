import { defer, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { CloudAppOutgoingEvents } from '../../lib/events/outgoing-events';
import { withErrorChecking } from './service-util';

@Injectable({
  providedIn: 'root'
})
export class CloudAppJwtService {

  constructor() { }

  get(): Observable<any> {
    return withErrorChecking(defer(() => CloudAppOutgoingEvents.getJwtAuthToken()));
  }

}
