import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'ms_access_token';
const USER_KEY = 'ms_username';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBase;

  /** Synced with sessionStorage for guards, header, and interceptor. */
  private readonly token = signal<string | null>(this.readStoredToken());

  readonly isLoggedIn = computed(() => !!this.token());

  constructor() {
    this.token.set(this.readStoredToken());
  }

  private readStoredToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  login(username: string, password: string): Observable<{ token: string; username: string }> {
    return this.http
      .post<{ token: string; username: string }>(`${this.base}/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          sessionStorage.setItem(TOKEN_KEY, res.token);
          sessionStorage.setItem(USER_KEY, res.username);
          this.token.set(res.token);
        }),
      );
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.token.set(null);
  }

  getToken(): string | null {
    return this.token();
  }

  getUsername(): string | null {
    return sessionStorage.getItem(USER_KEY);
  }
}
