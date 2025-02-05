import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActionSheetController, AlertController, IonButton, IonCard, IonCardContent, IonCardTitle, IonCol, IonGrid, IonIcon, IonRow, NavController, ToastController, IonLabel, IonItemDivider } from '@ionic/angular/standalone';
import { MyEvent } from 'src/app/shared/interfaces/my-event';
import { EventDistancePipe } from 'src/app/shared/pipes/event-distance.pipe';
import { EventsService } from '../services/events.service';
import { CurrencyPipe } from 'src/app/shared/pipes/currency.pipe';

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
                    icon: 'trash',
                    handler: () => this.nav.navigateRoot(['/events', 'edit', this.event().id]),
                },
                {
                    text: 'View',
                    icon: 'trash',
                    handler: () => this.nav.navigateRoot(['/events', this.event().id]),
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    data: {
                        action: 'cancel',
                    },
                },
            ],
        });

        await actionSheet.present();
    }

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
     * Handles the event when an image is not found.
     * Sets the error state to true.
     */
    imageNotFound = () => this.error.set(true);
}
