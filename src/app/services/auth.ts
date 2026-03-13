import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, of } from 'rxjs';

interface LoginRequest {
  email: string;
  contrasena: string;
}

interface LoginResponse {
  id: number;
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
        console.log('DEBUG [Auth]: Login Response:', response);
        if (this.isBrowser) {
          // 🪣 Guardamos token y datos del usuario
          localStorage.setItem('token', response.token);
          
          // Creamos el objeto de usuario mezclando todo lo que venga del backend
          const userObj: any = { ...response };
          
          // 🧠 JWT DECODE: Intentamos extraer el ID del token si no está en la respuesta
          const decoded = this.decodeToken(response.token);
          console.log('DEBUG [Auth]: Decoded Token:', decoded);
          
          if (decoded) {
            // El ID suele venir en 'sub', 'id', 'userId' o 'clienteId'
            const idFromToken = decoded.id || decoded.userId || decoded.clienteId || decoded.sub;
            if (idFromToken && !isNaN(Number(idFromToken))) {
              userObj.id = Number(idFromToken);
              console.log('DEBUG [Auth]: ID recovered from Token:', userObj.id);
            }
          }

          // Si el ID viene con otro nombre (ej: clienteId), lo normalizamos a 'id' también
          if (!userObj.id && userObj.clienteId) userObj.id = userObj.clienteId;
          
          localStorage.setItem('user', JSON.stringify(userObj));
        }
      })
    );
  }

  // 🧪 Helper para decodificar JWT sin librerías externas
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('DEBUG [Auth]: Error decoding token:', e);
      return null;
    }
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
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userJson) {
      const user = JSON.parse(userJson);
      console.log('DEBUG [Auth]: User in session:', user);
      
      // Intentamos encontrar el ID en varios campos comunes
      let userId = user.id || user.clienteId || user.usuarioId || user.idUsuario;
      
      // Si aún no lo encontramos, buscamos cualquier propiedad numérica que termine en 'id'
      if (!userId) {
        for (const key in user) {
          if (key.toLowerCase().endsWith('id') && typeof user[key] === 'number') {
            userId = user[key];
            break;
          }
        }
      }

      if (token && !userId) {
        console.warn('DEBUG [Auth]: No numerical ID found in session:', user);
      }
      return user;
    } else {
      console.log('DEBUG [Auth]: No user found in localStorage');
    }

    return null;
  }

  isLoggedIn(): boolean {
    return this.isBrowser ? !!localStorage.getItem('token') : false;
  }
}
