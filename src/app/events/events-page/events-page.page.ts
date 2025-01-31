import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { EventCardComponent } from '../event-card/event-card.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EventsService } from '../services/events.service';
import { ProfileService } from 'src/app/profile/services/profile.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MyEvent } from 'src/app/shared/interfaces/my-event';
import { EventsResponse } from 'src/app/shared/interfaces/responses';

@Component({
    selector: 'app-events-page',
    templateUrl: './events-page.page.html',
    styleUrls: ['./events-page.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, EventCardComponent, ReactiveFormsModule,]
})
export class EventsPagePage {
    private eventsService = inject(EventsService);
    private profileService = inject(ProfileService);
    private destroyRef = inject(DestroyRef);

    creator = input<number>();
    attending = input<number>();

    events = signal<MyEvent[]>([]);
    more = signal<boolean>(true);
    orderCriteria = signal<"distance" | "date" | "price">("distance");
    pageToLoad = signal<number>(1);
    filterSummary = signal<string>("");

    searchControl = new FormControl("");
    searchValue = toSignal(
        this.searchControl.valueChanges.pipe(
            debounceTime(600),
            distinctUntilChanged()
        )
    );  

    constructor() {
        effect(() => {
            this.eventsService
                .getEvents(
                    this.searchValue()!,
                    this.pageToLoad(),
                    this.orderCriteria(),
                    this.creator(),
                    this.attending()
                )
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((response: EventsResponse) => {
                    this.more.set(response.more);

                    if (this.pageToLoad() === 1) this.events.set(response.events);
                    else this.events.update((events) => [...events, ...response.events]);
                });
        });

        effect(() => {
            const filters: string[] = [];

            if (this.searchValue()) filters.push(`Searching by: "${this.searchValue()}"`);
            if (this.orderCriteria()) filters.push(`Ordering by: ${this.orderCriteria()}`);
            if (this.attending()) filters.push("Showing attending only");
            if (this.creator()) {
                this.profileService.getUser(this.creator()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user) => {
                    filters.push(`Events created by: User ${user.name}`);
                    this.filterSummary.set(filters.length ? filters.join(". ") + "." : "No filters applied.");
                });
            }

            this.filterSummary.set(filters.length ? filters.join(". ") + "." : "No filters applied.");
        });
    }

    /**
     * Deletes an event by ID, updates the server, and refreshes local state.
     * 
     * @param id The ID of the event to delete.
     */
    handleEventDeleted(id: number): void {
        this.events.update((events) => events.filter((event) => event.id !== id));
    }

    /**
     * Updates orderCriteria criteria signal.
     */
    orderBy(method: "distance" | "date" | "price"): void {
        this.pageToLoad.set(1);
        this.orderCriteria.set(method);
    }

    /**
     * Increments the current page number to load more events.
     */
    loadMoreEvents() {
        this.pageToLoad.update((page) => page + 1);
    }
}
