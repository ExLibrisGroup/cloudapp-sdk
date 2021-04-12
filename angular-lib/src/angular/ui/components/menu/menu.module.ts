import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "../../../modules/material.module";
import { TruncatePipe } from "./truncate.pipe";
import { MenuItemComponent } from "./menu-item/menu-item.component";
import { MenuComponent } from './menu/menu.component';
import { CommonModule } from "@angular/common";

@NgModule({
  imports: [
    MaterialModule,
    RouterModule,
    CommonModule,
  ],
  declarations: [MenuComponent, MenuItemComponent, TruncatePipe],
  exports: [MenuComponent, MenuItemComponent],
})
export class MenuModule { }