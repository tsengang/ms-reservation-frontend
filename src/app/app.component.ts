import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly translate = inject(TranslateService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    this.translate.addLangs(['en', 'fr']);
    const stored = localStorage.getItem('lang');
    const browser = navigator.language?.split('-')[0];
    const fallback = browser === 'fr' ? 'fr' : 'en';
    this.translate.use(stored === 'fr' || stored === 'en' ? stored : fallback);
  }

  setLang(lang: 'en' | 'fr'): void {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
