import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActionSheetController, AlertController, IonButton, IonCard, IonCardContent, IonCardTitle, IonCol, IonGrid, IonIcon, IonRow, NavController, ToastController } from '@ionic/angular/standalone';
import { MyEvent } from 'src/app/shared/interfaces/my-event';
import { CurrencyPipe } from 'src/app/shared/pipes/currency.pipe';
import { EventDistancePipe } from 'src/app/shared/pipes/event-distance.pipe';
import { EventsService } from '../services/events.service';

@Component({
    selector: 'app-event-card',
    templateUrl: './event-card.page.html',
    styleUrls: ['./event-card.page.scss'],
    standalone: true,
    imports: [EventDistancePipe, RouterLink, IonRow, IonGrid, IonButton, IonCardTitle, IonCardContent, IonCol, IonCard, IonIcon, CommonModule, FormsModule, CurrencyPipe, DatePipe]
})
export class EventCardPage {
    private destroyRef = inject(DestroyRef);
    private eventsService = inject(EventsService);
    private actionSheetCtrl = inject(ActionSheetController);
    private nav = inject(NavController);
    private alertCtrl = inject(AlertController);
    private toastCtrl = inject(ToastController);

    event = input.required<MyEvent>();
    deleted = output<number>();
    attend = output<boolean>();

    error = signal<boolean>(false);

    /**
     * Presents an action sheet with options to delete, edit, view, or cancel.
     * 
     * @returns {Promise<void>} A promise that resolves when the action sheet is presented.
     */
    async presentActionSheet() {
        const actionSheet = await this.actionSheetCtrl.create({
            header: 'Actions',
            buttons: [
                {
                    text: 'Delete',
                    role: 'destructive',
                    icon: 'trash-bin-sharp',
                    handler: () => this.confirmDelete(),
                },
                {
                    text: 'Edit',
                    icon: 'create-sharp',
                    handler: () => this.nav.navigateRoot(['/events', 'edit', this.event().id]),
                },
                {
                    text: 'View',
                    icon: 'eye-sharp',
                    handler: () => this.nav.navigateRoot(['/events', this.event().id]),
                },
                {
                    text: 'Cancel',
                    icon: 'close-sharp',
                    role: 'cancel',
                    data: {
                        action: 'cancel',
                    },
                },
            ],
        });

        await actionSheet.present();
    }

    /**
     * Presents a confirmation alert to the user before deleting an event.
     * If the user confirms, the event is deleted.
     * 
     * @returns {Promise<void>} A promise that resolves when the alert is presented.
     */
    async confirmDelete() {
        const alert = await this.alertCtrl.create({
            header: 'Confirm Delete',
            message: 'Are you sure you want to delete this event?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: () => this.deleteEvent(),
                },
            ],
        });

        await alert.present();
    }

    /**
     * Displays a toast notification with the specified message.
     *
     * @param {string} message - The message to display in the toast.
     * 
     * @returns {Promise<void>} A promise that resolves when the toast is presented.
     */
    async presentToast(message: string) {
        const toast = await this.toastCtrl.create({
            message,
            duration: 2000,
            position: 'bottom',
            color: 'danger',
        });
        await toast.present();
    }

    /**
     * Deletes himself from server and emits its own id upon deletion.
     */
    deleteEvent() {
        this.eventsService
            .deleteEvent(this.event().id!)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => { // #TODO use next error?
                this.presentToast('Event deleted successfully.');
                this.deleted.emit(this.event().id!);
            });
    }

    /**
     * Checks if the provided date is a valid Date object.
     *
     * @param {string} date - The date to be validated.
     * 
     * @returns `true` if the date is a valid Date object, otherwise `false`.
     */
    isValidDate(date: string): boolean {
        return !isNaN(new Date(date).getTime());
    }

    /**
     * Handles the event when an image is not found.
     * Sets the error state to true.
     */
    imageNotFound = () => this.error.set(true);
}
