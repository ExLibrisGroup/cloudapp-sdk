import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CloudAppEventsService, Entity, EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { i18n } from '../../i18n';

@Component({
  selector: 'eca-select-entities',
  templateUrl: './select-entities.component.html',
  styleUrls: ['./select-entities.component.scss'],
})
export class SelectEntitiesComponent implements OnInit, OnDestroy {

  private _entityType: EntityType | undefined;

  masterChecked = false;
  masterIndeterminate = false;
  items = new Array<SelectItem>();

  /* Entities Observable */
  @Input() entities$ = this.eventsService.entities$;
  subscription$ = new Subscription();

  private _selected = new Array<Entity>();
  /** Selected entities */
  @Input() set selected(value: Array<Entity>) {
    this._selected = value;
    this.items = this.items.map(i => ({ value: i.value, checked: this.isEntitySelected(i.value) }));
    this.determineMasterValue();
  };
  @Output() selectedChange = new EventEmitter<Entity[]>();

  /** Supported Entity Types */
  @Input() entityTypes: EntityType[] | undefined;

  /** Count of entities */
  @Output() count = new EventEmitter<number>(true);

  /** Truncate entity text to one line */
  @Input() truncate: boolean = false;

  /** Add line numbers to entity list */
  @Input() lineNumbers: boolean = false;

  constructor(
    private translate: TranslateService,
    private eventsService: CloudAppEventsService
  ) { }

  ngOnInit() {
    /* Subscribe to entities observable */
    this.subscription$ = this.entities$.subscribe(this.entitiesUpdated);
    /* Once app translations are loaded, merge with component strings */
    this.translate.getTranslation('en').pipe(take(1)).subscribe(() => {
      /* On the next tick otherwise template won't update */
      setTimeout(() => Object.entries(i18n).forEach(([k, v]) => this.translate.setTranslation(k, v, true)));
    });
    this.masterChecked = false;
  }

  ngOnDestroy() {
    this.subscription$.unsubscribe();
  }

  entitiesUpdated = (entities: Entity[]) => {
    if (Array.isArray(this.entityTypes)) {
      entities = entities.filter(e => this.entityTypes!.includes(e.type));
    }
    this.count.emit(entities.length);
    /* If different list, clear selected */
    if (entities.length == 0 || entities[0].type != this._entityType) {
      this.clear();
    }
    this._entityType = entities[0] && entities[0].type;
    this.items = entities.map(e => ({ value: e, checked: this.isEntitySelected(e) }));
    this.determineMasterValue();
  }

  masterChange() {
    Object.values(this.items).forEach(b => {
      b.checked = this.masterChecked;
      this.entitySelected(b.value, b.checked)
    })
  }

  listChange(e: Entity, checked: boolean) {
    this.determineMasterValue();
    this.entitySelected(e, checked);
  }

  entitySelected(entity: Entity, checked: boolean) {
    const index = this._selected.findIndex(e => entity.id === e.id)
    if (checked && !~index) this._selected.push(entity);
    else if (!checked && ~index) this._selected.splice(index, 1);
    this.selectedChange.emit(this._selected);
  }

  private isEntitySelected = (entity: Entity) => this._selected.some(e => entity.id === e.id);

  private determineMasterValue() {
    const checked_count = Object.values(this.items).filter(i => i.checked).length;
    this.masterChecked = checked_count == this.items.length;
    this.masterIndeterminate = checked_count > 0 && checked_count < this.items.length;
  }

  /** Clear all selected values */
  clear() {
    this._selected = [];
    this.selectedChange.emit(this._selected);
    Object.values(this.items).forEach(b => b.checked = false);
    this.determineMasterValue();
  }
}

interface SelectItem {
  checked: boolean;
  value: any;
}