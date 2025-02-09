import { RouterLink } from '@angular/router';
import { ChangeDetectorRef, Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonList, IonItem, IonAvatar, IonLabel, IonFab, IonIcon, IonFabButton } from '@ionic/angular/standalone';
import { EventDetailPage } from '../event-detail.page';
import { User } from 'src/app/shared/interfaces/user';
import { EventsService } from '../../services/events.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-event-attend',
    templateUrl: './event-attend.page.html',
    styleUrls: ['./event-attend.page.scss'],
    standalone: true,
    imports: [RouterLink, IonFabButton, IonIcon, IonFab, IonLabel, IonAvatar, IonItem, IonList, IonCardHeader, IonCard, IonContent, IonHeader, IonToolbar, CommonModule, FormsModule]
})
export class EventAttendPage {
    private eventService = inject(EventsService);
    private destroyRef = inject(DestroyRef);
    private cdr = inject(ChangeDetectorRef);

    event = inject(EventDetailPage).event;

    attendees = signal<User[]>([]);

    constructor() {
        this.showAttendees(this.event().id);
    }

    /**
     * Fetches and sets the attendees for the given event ID.
     * @param id - The ID of the event.
     */
    showAttendees(id: number) {
        this.eventService
            .getAttendees(id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((attendees) => {
                this.attendees.set(attendees);
            });
    }

    /**
     * Toggles attend status for the event.
     */
    toggleAttend() {
        this.eventService
            .toggleAttend(this.event().id!, this.event().attend)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((updatedStatus) => {
                this.event().attend = updatedStatus;
                this.event().numAttend += updatedStatus ? 1 : -1;
                this.showAttendees(this.event().id);
                this.cdr.markForCheck();
            });
    }
}
