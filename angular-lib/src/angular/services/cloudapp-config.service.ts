import { defer, Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import { ReadConfigResponse, WriteConfigResponse } from '../../lib/public-interfaces';
import { CloudAppOutgoingEvents } from '../../lib/events/outgoing-events';
import { withErrorChecking } from './service-util';
import { AbstractControl, FormArray, FormGroup, FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class CloudAppConfigService {

  constructor() { }

  get(): Observable<any> {
    console.log("SDK get aaa jjjjjjjjjjjjj");
    return withErrorChecking(defer(() => CloudAppOutgoingEvents.config()).pipe(
      concatMap(response => of(JSON.parse(response.config || '{}')))
    ));
  }

  // get(): Observable<any> {
  //   console.log("SDK get aaa");
  //   return withErrorChecking(defer(() => CloudAppOutgoingEvents.config()));
  //   // JSON.parse ?

    // return withErrorChecking(defer(() => CloudAppOutgoingEvents.config()).pipe(
    //   concatMap(response => of(JSON.parse(response.config || '{}')))
    // ));
  // }

  getAsFormGroup = (): Observable<any> => this.get().pipe(map(config => this.asFormGroup(config)));

  set(value: any): Observable<WriteConfigResponse> {
    return withErrorChecking(defer(() => CloudAppOutgoingEvents.config(JSON.stringify(value || {}))));
  }

  remove = (): Observable<WriteConfigResponse> => this.set('');

  private asFormGroup(object: Object): AbstractControl {
    if (Array.isArray(object)) {
      return new FormArray(object.map(entry=>this.asFormGroup(entry)));
    } else if (typeof object === 'object') {
      return new FormGroup(this.mapObject(object, obj => this.asFormGroup(obj)));
    } else {
      return new FormControl(object);
    }   
  }

  private mapObject(object: Object, mapFn: Function) {
    return Object.keys(object).reduce(function(result, key) {
      result[key] = mapFn(object[key])
      return result
    }, {})
  }
}
