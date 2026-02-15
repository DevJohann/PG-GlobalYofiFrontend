import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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
  private loginUrl = 'http://localhost:8080/api/auth/login';
  private registerUrl = 'http://localhost:8080/api/auth/register';

  constructor(private http: HttpClient) {}

  // 🔐 LOGIN
  login(email: string, contrasena: string): Observable<LoginResponse> {
    const body: LoginRequest = { email, contrasena };

    return this.http.post<LoginResponse>(this.loginUrl, body).pipe(
      tap(response => {
        // 🪣 Guardamos token y datos del usuario
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          nombre: response.nombre,
          rol: response.rol,
          email: response.email
        }));
      })
    );
  }

  // 🧾 REGISTRO
  register(data: RegisterRequest): Observable<any> {
    return this.http.post<any>(this.registerUrl, data);
  }

  // 🚪 LOGOUT
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // 🧠 GETTERS
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
