import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateModule } from '@ngx-translate/core';
import { SelectEntitiesComponent } from './components/select-entities/select-entities.component';
import { SelectEntityComponent } from './components/select-entity/select-entity.component';
import { TruncatePipe } from './truncate.pipe';

@NgModule({
  imports: [ 
    MaterialModule, 
    FormsModule, 
    CommonModule,
    TranslateModule,
  ],
  declarations: [ SelectEntitiesComponent, SelectEntityComponent, TruncatePipe, ],
  exports: [ SelectEntitiesComponent, SelectEntityComponent ]
})
export class SelectEntitiesModule { }


