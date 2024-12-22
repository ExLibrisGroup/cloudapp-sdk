import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class HttpTranslateLoader implements TranslateLoader {

  constructor(private http: HttpClient) { }

  public getTranslation(lang: string): Observable<TranslationObject> {
    return this.http.get(`i18n/${lang}.json`).pipe(catchError(() => of(null))) as Observable<TranslationObject>;
  }

}

@NgModule()
export class CloudAppTranslateModule {
  static forRoot(): ModuleWithProviders<TranslateModule> {
    return TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: HttpTranslateLoader,
        deps: [HttpClient]
      }
    });
  }
}
