import { isEqual } from 'lodash';
import { takeUntil, concatMap, map } from 'rxjs/operators';
import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscription, BehaviorSubject, Observable, defer, throwError, of, fromEventPattern } from 'rxjs';

import { MessageEventHandler } from '../../lib/messages/interfaces';
import { PageInfo, InitData, RefreshPageResponse, Entity } from '../../lib/public-interfaces';
import { CloudAppOutgoingEvents } from '../../lib/events/outgoing-events';
import { CloudAppIncomingEvents } from '../../lib/events/incoming-events';
import { EventServiceLogger as logger } from './service-loggers';

@Injectable({
  providedIn: 'root'
})
export class CloudAppEventsService implements OnDestroy {

  private _unsubscribeSubject$: Subject<void>;

  private pageInfo: any;
  private _onPageLoadHandler: MessageEventHandler<any>;
  private _onPageLoadSubject$: BehaviorSubject<any>;

  constructor() {
    logger.log('Initializing CloudAppEventsService');
    this._init();
  }

  readonly entities$: Observable<Entity[]> = fromEventPattern<PageInfo>(
    (handler) => this.onPageLoad(handler),
    (_, subscription) => subscription.unsubscribe()
  ).pipe(
    map((pageInfo) => pageInfo.entities ?? [])
  );

  getInitData(): Observable<InitData> {
    return this._getObservable(CloudAppOutgoingEvents.getInitData).pipe(
      /* Dev environment returns https://localhost for URLs */
      map((data: InitData)=>{
        Object.entries(data.urls).forEach(([key, value]) => {
          if (value.startsWith('https://localhost')) {
            data.urls[key] = data.urls[key].replace('https', 'http');
          }
        })
        return data;
      })
    );
  }

  getPageMetadata(): Observable<PageInfo> {
    return this._getObservable(CloudAppOutgoingEvents.getPageMetadata, 'pageInfo');
  }

  getAuthToken(): Observable<string> {
    return this._getObservable(CloudAppOutgoingEvents.getAuthToken).pipe(
      map(response => response.jwt)
    );
  }

  refreshPage(): Observable<RefreshPageResponse> {
    return this._getObservable(CloudAppOutgoingEvents.reloadPage);
  }

  back(): Observable<RefreshPageResponse> {
    return this._getObservable(CloudAppOutgoingEvents.almaBack);
  }
  
  home(): Observable<RefreshPageResponse> {
    return this._getObservable(CloudAppOutgoingEvents.almaMainPage);
  }

  onPageLoad(handler: (pageInfo: PageInfo) => void): Subscription {
    return this._subscribe(this._onPageLoadSubject$, handler);
  }

  private _getPageMetadata(): Observable<PageInfo> {
    return this._getObservable(CloudAppOutgoingEvents.getPageMetadata);
  }

  private _init() {
    this._unsubscribeSubject$ = new Subject<void>();
    this._initListener('PageLoad', CloudAppIncomingEvents.onPageLoad, { entities: [] }, 'pageInfo', this._getPageMetadata());
  }

  private _initListener(name: string, register: (x: any) => any, defaultValue?: any, prop?: string, initValue?: Observable<any>): void {
    this[`_on${name}Subject$`] = new BehaviorSubject(defaultValue);
    this[`_on${name}Handler$`] = (sender: any, data: any, ev: any) => this.handleEvent(name, data, prop);
    if (initValue) {
      initValue.subscribe(val => this[`_on${name}Handler$`](null, val, null));
    }
																										 
    register(this[`_on${name}Handler$`]);
    logger.log(`Registered handler '_on${name}Handler$'`);
  }

  private handleEvent(name: string, data: any, prop?: string) {
    if (!prop || !isEqual(this[prop], data)) {
      if (prop) {
        this[prop] = data;
        logger.log(`[${name}] Updated prop '${prop}' with data:`, data);
      }
      logger.log(`[${name}] Broadcasting to subscribers`);
      this[`_on${name}Subject$`].next(data);
    } else {
      logger.log(`[${name}] Event received, but no data change detected`);
    }
  }

  private _getObservable(f: () => Promise<any>, prop?: string): Observable<any> {
    return defer(() => f()).pipe(concatMap(data => {
      if (data && data.error) {
        return throwError(data);
      }
      if (prop) {
        this[prop] = data;
        logger.log(`Updated prop '${prop}' with data: `, data);
      }
      return of(data);
    }));
  }

  private _subscribe(subject$: Subject<any>, handler: (x: any) => any) {
    return subject$.pipe(takeUntil(this._unsubscribeSubject$)).subscribe({
      next: data => {
        try {
          handler(data);
        } catch (e) {
          console.error('Error encountered while running handler', e);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeSubject$.next();
    this._unsubscribeSubject$.complete();
    CloudAppIncomingEvents.offPageLoad(this._onPageLoadHandler);
  }

}
