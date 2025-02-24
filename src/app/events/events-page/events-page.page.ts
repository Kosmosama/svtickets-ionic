import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, effect, inject, input, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonMenuButton, IonButton, IonSearchbar, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonList, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, IonInfiniteScroll, IonInfiniteScrollContent, IonLoading, IonGrid, IonRow, IonCol, IonAlert, AlertController } from '@ionic/angular/standalone';
import { ProfileService } from 'src/app/profile/services/profile.service';
import { MyEvent } from 'src/app/shared/interfaces/my-event';
import { EventsResponse } from 'src/app/shared/interfaces/responses';
import { EventCardPage } from '../event-card/event-card.page';
import { EventsService } from '../services/events.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
    selector: 'app-events-page',
    templateUrl: './events-page.page.html',
    styleUrls: ['./events-page.page.scss'],
    standalone: true,
    imports: [IonMenuButton, IonCol, IonRow, IonGrid, IonSearchbar, IonInfiniteScrollContent, IonInfiniteScroll, RouterLink, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonIcon, IonFabButton, IonFab, IonRefresherContent, IonRefresher, IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, ReactiveFormsModule, EventCardPage],
})
export class EventsPagePage {
    private eventsService = inject(EventsService);
    private profileService = inject(ProfileService);
    private destroyRef = inject(DestroyRef);
    private alertCtrl = inject(AlertController);
    
    private refresher = viewChild(IonRefresher);
    private infinite = viewChild(IonInfiniteScroll);

    creator = input<number>();
    attending = input<number>();

    events = signal<MyEvent[]>([]);
    more = signal<boolean>(true);
    orderCriteria = signal<"distance" | "date" | "price">("distance");
    pageToLoad = signal<number>(1);
    filterSummary = signal<string>("");

    firstRenderFinished = false;

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

                    if (this.pageToLoad() === 1) {
                        this.events.set(response.events);
                        this.firstRenderFinished = true;
                    }
                    else {
                        this.events.update((events) => [...events, ...response.events]);
                    }
                
                    this.refresher()?.complete();
                    this.infinite()?.complete();
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
    // orderBy(method: "distance" | "date" | "price"): void {
    //     this.refresh();
    //     this.orderCriteria.set(method);
    // }

    /**
     * Refreshes the current page.
     */
    refresh() {
        this.pageToLoad.set(1);
    }

    /**
     * Increments the current page number to load more events.
     */
    loadMoreEvents() {
        this.pageToLoad.update((page) => page + 1);
    }

    /**
     * Presents an alert to the user for sorting events by different criteria.
     * 
     * @returns {Promise<void>} A promise that resolves when the alert is presented.
     */
    async presentSortAlert() {
        const alert = await this.alertCtrl.create({
            header: 'Sort Events',
            inputs: [
                { type: 'radio', label: 'Distance', value: 'distance', checked: this.orderCriteria() === 'distance' },
                { type: 'radio', label: 'Date', value: 'date', checked: this.orderCriteria() === 'date' },
                { type: 'radio', label: 'Price', value: 'price', checked: this.orderCriteria() === 'price' }
            ],
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                { 
                    text: 'OK', handler: (value) => {
                        this.refresh();
                        this.orderCriteria.set(value);
                    } 
                }
            ]
        });
        await alert.present();
    }
}
