import { Injectable, Type } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BaseDialog } from './components/dialog-base.component';
import { ConfirmDialog, ConfirmDialogData } from './components/confirm.component';
import { DialogType } from './dialog';
import { PromptDialog, PromptDialogData } from './components/prompt.component';
import { Observable } from 'rxjs';

@Injectable()
export class DialogService {

  constructor( 
    private dialog: MatDialog
  ) {}

  /** 
   * Confirm dialog 
   * @param {String} text Text to show in dialog
   * @returns {Observable<boolean>} Result of confirmation
   */
  confirm(text: string): Observable<any>;
  /** 
   * Confirm dialog 
   * @param {ConfirmDialogData} data Object with the prompt settings
   * @returns {Observable<boolean>} Result of confirmation
   */  
  confirm(data: ConfirmDialogData): Observable<any>;
  confirm(dataOrText: string | ConfirmDialogData): Observable<boolean> {
    const data = typeof dataOrText == 'string'
      ? { text: dataOrText }
      : dataOrText;
    return this.dialog.open(ConfirmDialog, {
      data: Object.assign({}, data, { type: DialogType.OK_CANCEL }),
      autoFocus: false
    }).afterClosed();
  }

  /** 
   * Alert dialog 
   * @param {String} text Text to show in dialog
   * @returns {Observable<void>}
   */
  alert(text: string): Observable<void>;
  /** 
   * Alert dialog 
   * @param {ConfirmDialogData} data Object with the prompt settings
   * @returns {Observable<void>}
   */  
  alert(data: ConfirmDialogData): Observable<void>;
  alert(dataOrText: string | ConfirmDialogData): Observable<void> {
    const data = typeof dataOrText == 'string'
      ? { text: dataOrText }
      : dataOrText;
    return this.dialog.open(ConfirmDialog, {
      data: Object.assign({}, data, { type: DialogType.OK }),
      autoFocus: true
    }).afterClosed();
  }

  /** 
   * Prompt dialog 
   * @param {String} text Text to show in dialog
   * @param {any} [value] Optional value to use in dialog
   * @returns {Observable<any>} Result data from the prompt
   */
  prompt(text: string, value?: any): Observable<any>;
  /** 
   * Prompt dialog 
   * @param {PromptDialogData} data Object with the prompt settings
   * @returns {Observable<any>} Result data from the prompt
   */
  prompt(data: PromptDialogData): Observable<any>;
  /** 
   * Prompt dialog 
   * @param {Type<BaseDialog>} component A component to be displayed
   * @param {PromptDialogData} data Object with the prompt settings
   * @returns {Observable<any>} Result data from the prompt
   */
  prompt(component: Type<BaseDialog>, data: PromptDialogData): Observable<any>;
  prompt(componentOrDataOrText: Type<BaseDialog> | PromptDialogData | string, dataOrVal?: PromptDialogData | any): Observable<any> {
    let component: Type<BaseDialog>;
    let data: PromptDialogData;
    if (typeof componentOrDataOrText == 'string') {
      component = PromptDialog;
      data = { text: componentOrDataOrText, val: dataOrVal };
    } else if (componentOrDataOrText instanceof Type) {
      component = componentOrDataOrText;
      data = dataOrVal;
    } else {
      component = PromptDialog;
      data = componentOrDataOrText;
    }
    return this.dialog.open(component, {
      data: Object.assign({}, data, { type: DialogType.OK_CANCEL }),
      autoFocus: false,
    }).afterClosed();
  }
}