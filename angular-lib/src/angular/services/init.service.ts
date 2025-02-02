import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { InitData } from '../../lib/public-interfaces';
import { CloudAppEventsService } from './cloudapp-events.service';

const DEFAULT_LANG = 'en';
const THEME_CLASS_PREFIX = 'cloudapp-theme--';

@Injectable({
    providedIn: 'root'
})
export class InitService {

    private _data!: InitData;

    constructor(private translate: TranslateService, private eventsService: CloudAppEventsService) {
        this.init();
    }

    get data() {
        return Object.assign({}, this._data);
    }

    private init() {
        this.translate.setDefaultLang(DEFAULT_LANG);
        this.eventsService.getInitData().subscribe({
            next: (data: InitData) => {
                this.setLanguage(data.lang);
                this.setThemeClass(data.color);
            },
            error: () => this.translate.use(DEFAULT_LANG)
        });
    }

    private setLanguage(lang: any) {
        if (!lang) { 
            return this.translate.use(DEFAULT_LANG); 
        }
        return this.translate.use(lang);
    }

    private setThemeClass(color: string) {
        if (!color) { return; }
        document.body.classList.forEach(cls => {
            if (cls.startsWith(THEME_CLASS_PREFIX)) {
                document.body.classList.remove(cls);
            }
        });
        document.body.classList.add(`${THEME_CLASS_PREFIX}${color}`);
    }

}
