import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from "@ngx-translate/core";
import { DialogData } from "../dialog";
import { BaseDialog } from "./dialog-base.component";

export interface ConfirmDialogData extends DialogData {

}

@Component({
  selector: 'confirmation-dialog',
  template: `<h2 mat-dialog-title translate>{{data.title}}</h2>
  <mat-dialog-content>
    <p>{{text}}</p>
  </mat-dialog-content>
  <mat-dialog-actions align="end">
    <button mat-flat-button color="secondary" *ngIf="data.type=='ok-cancel'" mat-dialog-close>{{data.cancel || 'Cancel' | translate}}</button>
    <button mat-flat-button color="secondary" [mat-dialog-close]="true" cdkFocusInitial>{{data.ok || 'OK' | translate}}</button>
  </mat-dialog-actions>`
})
export class ConfirmDialog extends BaseDialog {

  constructor(
    @Inject(MAT_DIALOG_DATA) public override data: ConfirmDialogData,
    public override translate: TranslateService,
  ) {
    super(data, translate);
  }
}