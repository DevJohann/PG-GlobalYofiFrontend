import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, of } from 'rxjs';

interface LoginRequest {
  email: string;
  contrasena: string;
}

interface LoginResponse {
  nombre: string;
  rol: string;
  email: string;
  token: string;
}

interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  contrasena: string;
  telefono: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = 'http://127.0.0.1:8080/api/auth/login';
  private registerUrl = 'http://127.0.0.1:8080/api/auth/register';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // 🔐 LOGIN
  login(email: string, contrasena: string): Observable<LoginResponse> {
    const body: LoginRequest = { email, contrasena };

    return this.http.post<LoginResponse>(this.loginUrl, body).pipe(
      tap(response => {
        if (this.isBrowser) {
          // 🪣 Guardamos token y datos del usuario
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify({
            nombre: response.nombre,
            rol: response.rol,
            email: response.email
          }));
        }
      })
    );
  }

  // 🧾 REGISTRO
  register(data: RegisterRequest): Observable<any> {
    return this.http.post<any>(this.registerUrl, data);
  }

  // 🚪 LOGOUT
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // 🧠 GETTERS
  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  getUser(): any {
    if (!this.isBrowser) return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return this.isBrowser ? !!localStorage.getItem('token') : false;
  }
}
