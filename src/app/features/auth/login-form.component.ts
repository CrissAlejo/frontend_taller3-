import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoginCredentials } from '../../core/models/auth';

@Component({ selector: 'app-login-form', templateUrl: './login-form.component.html' })
export class LoginFormComponent {
  @Input() isLoading = false;
  @Output() readonly submitLogin = new EventEmitter<LoginCredentials>();
  formModel: LoginCredentials = { email: '', password: '' };
  onSubmit(form: NgForm): void {
    if (this.isLoading || form.invalid) return;
    this.submitLogin.emit({ email: this.formModel.email.trim(), password: this.formModel.password });
  }
}
