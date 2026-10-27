import { Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LoginCredentials } from '../../core/models/auth';

@Component({ selector: 'app-login-dashboard', templateUrl: './login-dashboard.component.html' })
export class LoginDashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  loading = false;
  errorMessage: string | null = null;
  onExecuteLogin(credentials: LoginCredentials): void {
    if (this.loading) return;
    this.loading = true;
    this.errorMessage = null;
    this.auth.login(credentials).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading = false),
    ).subscribe({
      next: () => { void this.router.navigate(['/employees']); },
      error: (error: Error) => this.errorMessage = error.message,
    });
  }
}
