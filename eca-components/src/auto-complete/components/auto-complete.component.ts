import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { switchMap, debounceTime, tap, finalize, startWith, map, take, filter } from 'rxjs/operators';
import { AutoCompleteService } from '../auto-complete.service';
import { GetAllOptionsSettings } from '../public-interfaces';
import { Option } from '../public-interfaces';
import { i18n } from '../i18n';
import { isEqual } from 'lodash';

@Component({
  selector: 'eca-auto-complete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.scss']
})
export class AutoCompleteComponent implements OnInit {

  @Output() onOptionSelected = new EventEmitter();
  @Input() control = new UntypedFormControl();
  @Input() lazy: ((val: string) => Observable<Array<Option>>) | undefined;
  @Input() set data(data: (() => Observable<Array<Option>>) | GetAllOptionsSettings) {
    this.loadData(data);
  }
  @Input() label = 'AutoComplete.Select';
  @Input() placeholder = 'AutoComplete.Type';
  @Input() id: string | undefined;

  options = new Array<Option>();
  filteredOptions: Option[] | undefined = new Array<Option>();
  isLoading = false;

  constructor(
    private service: AutoCompleteService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    if (this.lazy) this.loadLazy();
  }

  ngAfterViewInit() {
    /* Once app translations are loaded, merge with component strings */
    this.translate.getTranslation('en').pipe(take(1)).subscribe(() => {
      /* On the next tick otherwise template won't update */
      setTimeout(() => Object.entries(i18n).forEach(([k, v]) => this.translate.setTranslation(k, v, true)));
    });
  }

  loadData(data: (() => Observable<Array<Option>>) | GetAllOptionsSettings) {
    const requestUrl = isGetAllOptions(data) &&
      (
        typeof data.request == 'string'
          ? data.request
          : data.request.url
      );
    if (this.id && this.service.options[this.id]) {
      this.options = this.service.options[this.id];
      this.subscribeData();
    } else if (requestUrl && this.service.options[requestUrl]) {
      this.options = this.service.options[requestUrl];
      this.subscribeData();
    } else {
      const get = isGetAllOptions(data)
        ? this.service.getAllOptions(data)
        : data();
      get.pipe(
        tap(results => {
          if (this.id) this.service.options[this.id] = results;
          else if (requestUrl) this.service.options[requestUrl] = results;
        })
      ).subscribe(results => {
        this.options = results;
        this.subscribeData();
      });
    }
  }

  subscribeData() {
    this.control.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filterOptions(value))
      ).subscribe(options => this.filteredOptions = options);
  }

  loadLazy() {
    this.control.valueChanges
      .pipe(
        debounceTime(300),
        filter(value => typeof value == 'string' && !!value),
        tap(() => this.isLoading = true),
        switchMap(value => this.lazy!(value).pipe(finalize(() => this.isLoading = false))),
      ).subscribe(options => this.filteredOptions = options);
  }

  displayFn = (value?: any): string => {
    const option = this.filteredOptions && this.filteredOptions.find(o => isEqual(o.value, value));
    return option ? option.name : value;
  }

  private _filterOptions(value: string): Option[] | undefined {
    if (typeof value != 'string') return;
    const filterValue = value.toLowerCase();
    return this.options
      .filter(option => option.name.toLowerCase().includes(filterValue))
      .sort(this.sortOptions);
  }

  sortOptions = (a: Option, b: Option) => {
    if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
    if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
    return 0;
  }

  clear() {
    this.control.setValue(null);
    this.onOptionSelected.emit(null);
  }
}

const isGetAllOptions = (obj: any): obj is GetAllOptionsSettings => {
  return (obj as GetAllOptionsSettings).request != undefined;
}