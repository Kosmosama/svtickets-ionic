import { CommonModule } from '@angular/common';
import { Component, input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonButtons, IonHeader, IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { MyEvent } from 'src/app/shared/interfaces/my-event';

@Component({
    selector: 'app-event-detail',
    templateUrl: './event-detail.page.html',
    styleUrls: ['./event-detail.page.scss'],
    standalone: true,
    imports: [IonLabel, IonIcon, IonTabButton, IonTabBar, IonTabs, IonBackButton, IonButtons, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class EventDetailPage {
    event = input.required<MyEvent>();
}
