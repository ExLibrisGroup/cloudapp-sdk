import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@exlibris/exl-cloudapp-angular-lib";
import { TranslateModule } from "@ngx-translate/core";
import { AutoCompleteComponent } from "./components/auto-complete.component";
import { AutoCompleteService } from "./auto-complete.service";

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  declarations: [ AutoCompleteComponent ],
  exports: [ AutoCompleteComponent ],
  providers: [ AutoCompleteService ],
})
export class AutoCompleteModule { }