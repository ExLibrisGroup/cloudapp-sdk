import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { DialogData } from "../dialog";

@Component({
  selector: 'base-dialog',
  template: ''
})
export class BaseDialog {

  text: string | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public translate: TranslateService,
  ) { }

  ngOnInit() {
  }

  ngAfterContentInit() {
    let text: string | undefined, options: any;
    if (Array.isArray(this.data.text)) {
      [text, options] = this.data.text;
    } else {
      text = this.data.text;
    }
    if (!!text) this.text = this.translate.instant(text, options);
  }

}