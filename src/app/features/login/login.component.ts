import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  error: string | null = null;
  loading = false;

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      void this.router.navigateByUrl('/customers');
    }
  }

  submit(): void {
    this.error = null;
    if (!this.username.trim() || !this.password) {
      return;
    }
    this.loading = true;
    this.auth.login(this.username.trim(), this.password).subscribe({
      next: () => {
        this.loading = false;
        void this.router.navigateByUrl('/customers');
      },
      error: (e: HttpErrorResponse) => {
        this.loading = false;
        const body = e.error;
        if (typeof body === 'object' && body && 'message' in body) {
          this.error = String((body as { message: string }).message);
        } else if (e.status === 0) {
          this.error = 'Network error';
        } else {
          this.error = 'Login failed';
        }
      },
    });
  }
}
