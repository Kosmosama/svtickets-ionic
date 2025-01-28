import { ChangeDetectorRef, Component, DestroyRef, inject, input, output, signal, viewChild } from '@angular/core';
import { MyEvent } from '../../shared/interfaces/my-event';
import { DatePipe, NgClass } from '@angular/common';
import { CurrencyPipe } from '../../shared/pipes/currency.pipe';
import { RouterLink } from '@angular/router';
import { EventsService } from '../services/events.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { EventDistancePipe } from '../../shared/pipes/event-distance.pipe';

@Component({
    selector: 'event-card',
    standalone: true,
    imports: [DatePipe, CurrencyPipe, RouterLink, EventDistancePipe, NgClass], // SweetAlert2Module, 
    templateUrl: './event-card.component.html',
    styleUrl: './event-card.component.css'
})
export class EventCardComponent {
    private destroyRef = inject(DestroyRef);
    private eventsService = inject(EventsService);
    private cdr = inject(ChangeDetectorRef);

    event = input.required<MyEvent>();
    deleted = output<number>();
    attend = output<boolean>();
    
    error = signal<boolean>(false);

    /**
     * Deletes himself from server and emits its own id upon deletion.
     */
    deleteEvent() {
        this.eventsService
            .deleteEvent(this.event().id!)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.deleted.emit(this.event().id!));
    }

    /**
     * Toggles attend status for the event.
     */
    attendEvent() {
        this.eventsService
            .toggleAttend(this.event().id!, this.event().attend)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((updatedStatus) => {
                this.event().attend = updatedStatus;
                this.event().numAttend += updatedStatus ? 1 : -1;
                this.attend.emit(updatedStatus);
                this.cdr.markForCheck();
            });
    }

    /**
     * Handles the event when an image is not found.
     * Sets the error state to true.
     */
    imageNotFound() {
        this.error.set(true);
    }
}
