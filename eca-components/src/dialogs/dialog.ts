export interface DialogData {
  /** Title of the dialog window */
  title?: string;
  /** Text of the dialog window. Pass translation options as second value in array */
  text?: string | any[];
  /** Text for cancel button */
  cancel?: string;
  /** Text for OK button */
  ok?: string;
  /** ok or ok-cancel */
  type?: DialogType;
}

export enum DialogType {
  OK = 'ok',
  OK_CANCEL = 'ok-cancel',
}