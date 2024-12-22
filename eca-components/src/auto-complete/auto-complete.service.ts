import { Injectable } from "@angular/core";
import { CloudAppRestService, Request } from "@exlibris/exl-cloudapp-angular-lib";
import { cloneDeep, isNil, omitBy } from 'lodash';
import { forkJoin, iif, Observable, of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { GetAllOptionsSettings, Option } from './public-interfaces';

@Injectable()
export class AutoCompleteService {
  options: { [key: string]: Option[] } = {};

  constructor(
    private restService: CloudAppRestService
  ) { }

  ngOnInit() {
  }

  getAllOptions(options: GetAllOptionsSettings): Observable<Option[]> {
    const defaultOpts = {
      name: (obj: any) => obj.name,
      value: (obj: any) => obj,
    }
    const opts = Object.assign(defaultOpts, omitBy(options, isNil));
    return this.getAll(options.request).pipe(
      map(results =>
        findArray(results)
          .map(r => ({ value: opts.value(r), name: opts.name(r) }))
      )
    )
  }

  /** Use Alma default parameters to retrieve all items in pages */
  getAll<T = any>(request: string | Request,
    options: { arrayName: string | null | undefined; chunkSize: number } = { arrayName: null, chunkSize: 50 }) {
    let { arrayName, chunkSize } = options;
    let array: Array<any>, count: number;
    let req: Request = typeof request == 'string' ? { url: request } : request;
    if (!req.queryParams) req.queryParams = {};
    req.queryParams['limit'] = chunkSize;
    return this.restService.call(req).pipe(
      tap(results => {
        arrayName = arrayName || findArrayName(results);
        array = results[arrayName!];
        count = results.total_record_count || 0;
      }),
      switchMap(results => iif(
        () => !(arrayName && Array.isArray(results[arrayName]) && count > results[arrayName].length),
        of(results as T),
        forkJoin(
          arrayOf(Math.ceil(count / chunkSize) - 1)
            .map(i => {
              const newReq = cloneDeep(req);
              newReq!.queryParams!['offset'] = (i + 1) * chunkSize;
              return this.restService.call(newReq);
            })
        )
          .pipe(
            map(results => {
              for (const result of results) {
                array = array.concat(result[arrayName!]);
              }
              return Object.assign(results[0], Object.assign(results[0], { [arrayName!]: array })) as T;
            })
          )
      ))
    )
  }
}

const arrayOf = (length: number) => Array.from({ length: length }, (v, i) => i);
const findArray = (obj: Object): Array<any> => (obj as any)[findArrayName(obj)!] || [];
const findArrayName = (obj: Object) => Object.keys(obj).find(k => Array.isArray((obj as any)[k]));