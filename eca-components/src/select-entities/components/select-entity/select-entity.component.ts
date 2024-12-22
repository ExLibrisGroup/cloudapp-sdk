import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { CloudAppEventsService } from '@exlibris/exl-cloudapp-angular-lib';
import { Entity, EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { Subscription } from 'rxjs';

@Component({
  selector: 'eca-select-entity',
  templateUrl: './select-entity.component.html',
  styleUrls: ['./select-entity.component.scss'],
})
export class SelectEntityComponent implements OnInit, OnDestroy {

    private _entityType: EntityType | undefined;
    entities: Entity[] = [];

    /* Entities Observable */
    @Input() entities$ = this.eventsService.entities$;
    subscription$ = new Subscription();
  
    /** Selected entities */
    @Input() selected: Entity | undefined | null;
    @Output() selectedChange = new EventEmitter<Entity | null>();
  
    /** Supported Entity Types */
    @Input() entityTypes: EntityType[] = [];
  
    /** Count of entities */
    @Output() count = new EventEmitter<number>(true);

    /** Truncate entity text to one line */
    @Input() truncate = false;

    /** Add line numbers to entity list */
    @Input() lineNumbers = false;

    constructor(
      private eventsService: CloudAppEventsService,
    ) { }
  
    ngOnInit() {
      /* Subscribe to entities observable */
      this.subscription$ = this.entities$.subscribe(this.entitiesUpdated);
    }

    ngOnDestroy() {
      this.subscription$.unsubscribe();
    }

    entitiesUpdated = (entities: Entity[]) => {
      if (Array.isArray(this.entityTypes))
        entities = entities.filter(e => this.entityTypes.includes(e.type));
      this.entities = entities;
      this.count.emit(entities.length);
      /* If different list, clear selected */
      if (entities.length == 0 || entities[0].type != this._entityType) {
        this.clear();
      }
      this._entityType = entities[0] && entities[0].type;
    }

    entitySelected() {
      this.selectedChange.emit(this.selected);
    }

    /** Clear all selected values */
    clear() {
      this.selected = null;
      this.selectedChange.emit(this.selected);
    }

}
