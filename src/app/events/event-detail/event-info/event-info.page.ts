import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { EventCardPage } from "../../event-card/event-card.page";
import { EventDetailPage } from '../event-detail.page';

@Component({
    selector: 'app-event-info',
    templateUrl: './event-info.page.html',
    styleUrls: ['./event-info.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, EventCardPage]
})
export class EventInfoPage {
    event = inject(EventDetailPage).event;
}
