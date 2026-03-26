import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification, ConfirmRequest } from '../../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.css']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  currentConfirm: ConfirmRequest | null = null;

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notif => {
      this.notifications.push(notif);
      this.cdr.detectChanges();
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
        this.cdr.detectChanges();
      }, 5000);
    });

    this.notificationService.confirmRequests$.subscribe(req => {
      this.currentConfirm = req;
      this.cdr.detectChanges();
    });
  }

  handleConfirm(response: boolean): void {
    if (this.currentConfirm) {
      this.currentConfirm.resolve(response);
      this.currentConfirm = null;
      this.notificationService.closeConfirm();
      this.cdr.detectChanges();
    }
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }
}
