import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonAlert, IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonRow, IonText, IonTextarea, IonTitle, IonToolbar, NavController, ToastController } from '@ionic/angular/standalone';
import { SearchResult } from 'src/app/ol-maps/search-result';
import { minDateValidator } from 'src/app/shared/directives/min-date.directive';
import { MyEvent, MyEventInsert } from 'src/app/shared/interfaces/my-event';
import { GaAutocompleteDirective } from "../../ol-maps/ga-autocomplete.directive";
import { OlMapDirective } from "../../ol-maps/ol-map.directive";
import { OlMarkerDirective } from "../../ol-maps/ol-marker.directive";
import { EventsService } from '../services/events.service';

@Component({
    selector: 'app-event-form',
    templateUrl: './event-form.page.html',
    styleUrls: ['./event-form.page.scss'],
    standalone: true,
    imports: [RouterLink, IonImg, IonTextarea, IonGrid, IonRow, IonCol, IonText, IonInput, IonLabel, IonItem, IonList, IonAlert, IonIcon, IonButton, IonContent, IonHeader, IonTitle, IonToolbar, ReactiveFormsModule, DatePipe, OlMapDirective, OlMarkerDirective, GaAutocompleteDirective]
})
export class EventFormPage {
    private eventsService = inject(EventsService);
    private destroyRef = inject(DestroyRef);
    private nav = inject(NavController);
    private changeDetector = inject(ChangeDetectorRef);
    private toastCtrl = inject(ToastController);

    event = input<MyEvent>();

    today: string = new Date().toISOString().split('T')[0];
    coordinates = signal<[number, number]>([-0.5, 38.5]);
    addEventErrorCode = signal<number | null>(null);

    saved = false;
    base64image = "";
    address = "";

    changePlace(result: SearchResult) {
        this.coordinates.set(result.coordinates);
        this.address = result.address;
    }

    private fb = inject(NonNullableFormBuilder);
    eventForm = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(5), Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
        date: ['', [Validators.required, minDateValidator(this.today)]],
        description: ['', [Validators.required]],
        price: [0, [Validators.required, Validators.min(0.1)]],
        // image: ['', [this.imageRequiredValidatior()]],
    });

    constructor() {
        effect(() => {
            if (this.event()) {
                this.eventForm.get('title')?.setValue(this.event()!.title);
                this.eventForm.get('date')?.setValue(this.event()!.date.split(' ')[0]);
                this.eventForm.get('description')?.setValue(this.event()!.description);
                this.eventForm.get('price')?.setValue(this.event()!.price);
                this.coordinates.set([this.event()!.lng, this.event()!.lat]);
                this.address = this.event()!.address;
                this.base64image = this.event()!.image;
                this.eventForm.markAllAsTouched();
            }
        });
    }

    /**
     * Handles adding a new event by interacting with the EventsService.
     * Navigates user back to "/events" upon creation.
     */
    submitNewEvent(): void {
        const [lng, lat] = this.coordinates();
        const event: MyEventInsert = {
            ...this.eventForm.getRawValue(),
            image: this.base64image,
            address: this.address,
            lat: lat,
            lng: lng
        };

        this.eventsService.saveEvent(event, this.event()?.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.saved = true;
                    this.nav.navigateRoot(['/events']);
                },
                error: (error) => {
                    this.addEventErrorCode.set(error.status);
                }
            });
    }

    /**
     * Picks an image from the device.
     * 
     * @returns {Promise<void>} A promise that resolves when the photo is picked and processed.
     */
    async pickFromGallery() {
        const photo = await Camera.getPhoto({
            source: CameraSource.Photos,
            height: 768,
            width: 1024,
            allowEditing: true,
            resultType: CameraResultType.DataUrl // Base64 (url encoded)
        });

        this.base64image = photo.dataUrl as string;
        this.changeDetector.markForCheck();
    }

    /**
     * Determines whether the user can navigate away from the current page.
     * If there are unsaved changes, the user is prompted with a confirmation dialog.
     * 
     * @returns "True" if the changes were saved, form values were not changed or the user confirms the dialog, otherwise "False".
     */
    async canDeactivate() {
        const isImageUnchanged = this.base64image === "" || (this.event() && this.base64image === this.event()?.image);
        if (this.saved || (this.eventForm.pristine && isImageUnchanged)) return true;

        const toast = await this.toastCtrl.create({
            message: 'Changes will not be saved. Do you want to leave the page?',
            position: 'bottom',
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                { text: 'Leave', role: 'leave' }
            ]
        });

        await toast.present();
        return (await toast.onDidDismiss()).role === 'leave';
    }
}
