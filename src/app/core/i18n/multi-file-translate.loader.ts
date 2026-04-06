import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Loads separate JSON files per language: header.json + tabs.json (+ optional forms.json).
 * Use keys like HEADER.APP_TITLE, TABS.CUSTOMERS, FORMS.SAVE in templates.
 */
export class MultiFileTranslateLoader implements TranslateLoader {
  constructor(private readonly http: HttpClient) {}

  getTranslation(lang: string): Observable<Record<string, unknown>> {
    const base = `./assets/i18n/${lang}`;
    return forkJoin({
      header: this.http.get<Record<string, string>>(`${base}/header.json`),
      tabs: this.http.get<Record<string, string>>(`${base}/tabs.json`),
      forms: this.http.get<Record<string, string>>(`${base}/forms.json`),
    }).pipe(
      map(({ header, tabs, forms }) => ({
        HEADER: header,
        TABS: tabs,
        FORMS: forms,
      })),
    );
  }
}
