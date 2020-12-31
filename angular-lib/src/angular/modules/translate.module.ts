import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators'

export class LazyTranslateLoader implements TranslateLoader {
    getTranslation(lang: string): Observable<any> {
      return from(import(`src/i18n/${lang}.json`)).pipe(catchError(err=>of(null)));
    }
  }

export function getTranslateModule() {
    return TranslateModule.forRoot({
        loader: {
            provide: TranslateLoader,
            useClass: (LazyTranslateLoader)
        }
    });
}
