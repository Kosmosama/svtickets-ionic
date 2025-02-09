import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, viewChild } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AlertController, IonAvatar, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonRefresher, IonRefresherContent, IonToolbar, Platform, IonGrid, IonRow, IonCol, ToastController, IonCardTitle, IonCardHeader, IonCard } from '@ionic/angular/standalone';
import { EventsService } from '../../services/events.service';
import { EventDetailPage } from '../event-detail.page';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-event-comments',
    templateUrl: './event-comments.page.html',
    styleUrls: ['./event-comments.page.scss'],
    standalone: true,
    imports: [IonCard, IonCardHeader, IonCardTitle, IonCol, IonRow, IonGrid, IonAvatar, IonIcon, RouterLink, IonFabButton, IonFab, IonRefresher, IonRefresherContent, IonItem, IonList, IonContent, IonHeader, IonToolbar, CommonModule, FormsModule]
})
export class EventCommentsPage {
    private alertCtrl = inject(AlertController);
    private eventService = inject(EventsService);
    private platform = inject(Platform);
    private toastCtrl = inject(ToastController);

    event = inject(EventDetailPage).event;

    ionRefresher = viewChild.required(IonRefresher);

    commentsResource = rxResource({
        request: () => this.event().id,
        loader: ({ request: id }) => this.eventService.getComments(id)
    });
    comments = computed(() => this.commentsResource.value() ?? []);

    constructor() {
        this.platform.resume.pipe(takeUntilDestroyed()).subscribe(
            () => this.commentsResource.reload()
        );

        effect(() => {
            if (!this.commentsResource.isLoading()) {
                this.ionRefresher().complete();
            }
        });
    }

    /**
     * Loads the comments for the event by refreshing the comments resource.
     *
     * @param refresher - Optional IonRefresher instance to trigger a reload.
     */
    loadComments(refresher?: IonRefresher) {
        this.commentsResource.reload();
    }

    /**
     * Prompts the user to add a new comment via an alert dialog.
     * If the comment is valid, it posts the comment to the event service
     * and updates the comments resource.
     * Displays a toast message if the comment is empty.
     * 
     * @returns {Promise<void>} A promise that resolves when the comment is added or the alert is dismissed.
     */
    async addComment() {
        const alert = await this.alertCtrl.create({
            header: 'New commment',
            inputs: [
                {
                    name: 'comment',
                    type: 'text',
                    placeholder: 'Enter your comment',
                },
            ],
            buttons: [
                {
                    text: 'Add',
                    role: 'ok',
                },
                {
                    role: 'cancel',
                    text: 'Cancel',
                },
            ],
        });

        await alert.present();
        const result = await alert.onDidDismiss();

        if (result.role === 'ok') {
            const comment = result.data.values.comment?.trim();

            if (!comment) {
                const toast = await this.toastCtrl.create({
                    message: 'The comment cannot be empty.',
                    duration: 2000,
                    color: 'danger',
                });
                await toast.present();
                return;
            }

            this.eventService
                .postComment(this.event().id, comment)
                .subscribe((comment) =>
                    this.commentsResource.update((comments) => [comment, ...comments!])
                );
        }
    }
}
