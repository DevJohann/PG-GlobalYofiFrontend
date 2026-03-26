import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
  id: number;
}

export interface ConfirmRequest {
  message: string;
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  private confirmSubject = new Subject<ConfirmRequest | null>();

  notifications$ = this.notificationSubject.asObservable();
  confirmRequests$ = this.confirmSubject.asObservable();

  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.notificationSubject.next({ message, type, id: this.counter++ });
  }

  success(message: string): void { this.show(message, 'success'); }
  error(message: string): void { this.show(message, 'error'); }
  info(message: string): void { this.show(message, 'info'); }

  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmSubject.next({ message, resolve });
    });
  }

  closeConfirm(): void {
    this.confirmSubject.next(null);
  }
}
