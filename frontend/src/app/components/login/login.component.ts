import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = { email: '', password: '' };
  signupData = { username: '', email: '', password: '', address: '', phone: '' };
  isLogin = true;
  error = '';
  loading = false;
  successMessage = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  onSubmit() {
    this.loading = true;
    this.error = '';
    this.successMessage = '';

    if (this.isLogin) {
      // Login
      this.apiService.login(this.loginData).subscribe({
        next: (res: any) => {
          console.log('Login response:', res);
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.successMessage = 'Login successful! Redirecting...';
          this.loading = false;
          
          setTimeout(() => {
            if (res.user.role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/user']);
            }
          }, 1000);
        },
        error: (err: any) => {
          console.error('Login error:', err);
          this.error = err.error?.msg || 'Invalid credentials. Please try again.';
          this.loading = false;
        }
      });
    } else {
      // Signup
      console.log('Signup data:', this.signupData);
      
      // Validate signup data
      if (!this.signupData.email || !this.signupData.password) {
        this.error = 'Email and password are required';
        this.loading = false;
        return;
      }
      
      if (this.signupData.password.length < 6) {
        this.error = 'Password must be at least 6 characters';
        this.loading = false;
        return;
      }

      this.apiService.signup(this.signupData).subscribe({
        next: (res: any) => {
          console.log('Signup response:', res);
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.successMessage = 'Account created! Redirecting...';
          this.loading = false;
          
          setTimeout(() => {
            if (res.user.role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate(['/user']);
            }
          }, 1000);
        },
        error: (err: any) => {
          console.error('Signup error:', err);
          this.error = err.error?.msg || 'Registration failed. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.error = '';
    this.successMessage = '';
  }
}