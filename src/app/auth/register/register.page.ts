import { afterNextRender, ChangeDetectorRef, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { IonAlert, IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonRow, IonText, IonTitle, IonToolbar, NavController, ToastController } from "@ionic/angular/standalone";
import { User } from '../../shared/interfaces/user';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
    standalone: true,
    imports: [IonImg, IonCol, IonRow, IonGrid, IonIcon, IonButton, IonItem, RouterLink, IonInput, IonAlert, IonText, IonLabel, IonList, IonContent, IonHeader, IonToolbar, IonTitle, ReactiveFormsModule], // IonRouterLink, 
})
export class RegisterPage {
    private authService = inject(AuthService);
    private fb = inject(NonNullableFormBuilder);
    private destroyRef = inject(DestroyRef);
    private toastCtrl = inject(ToastController);
    private nav = inject(NavController);
    private changeDetector = inject(ChangeDetectorRef);

    registerErrorCode = signal<number | null>(null);

    saved = false;
    base64image = "";

    constructor() {
        afterNextRender(() => {
            Geolocation.getCurrentPosition({ enableHighAccuracy: true })
                .then((coordinates) => {
                    this.registerForm.get('lat')?.setValue(coordinates.coords.latitude);
                    this.registerForm.get('lng')?.setValue(coordinates.coords.longitude);
                })
                .catch((error) => {
                    console.warn(error);
                });
        })
    }

    registerForm = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        repeatEmail: ['', [Validators.required, Validators.email, this.repeatEmailValidator()]],
        password: ['', [Validators.required, Validators.minLength(4)]],
        lat: [0],
        lng: [0],
    });

    /**
     * Validator function to check if the repeated email matches the original email.
     * 
     * @returns A ValidatorFn that returns null if the emails match, or an object with the key `emailMismatch` set to true if they do not.
     */
    repeatEmailValidator(): ValidatorFn {
        return ({ parent, value }: AbstractControl) => parent?.get('email')?.value === value ? null : { emailMismatch: true };
    }

    /**
     * Submits the registration form and navigates to the login page upon success.
     */
    register() {
        this.registerErrorCode.set(null);

        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.authService
            .register({
                ...this.registerForm.getRawValue(),
                avatar: this.base64image,
            } as User)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: async () => {
                    (await this.toastCtrl.create({
                        duration: 3000,
                        position: 'bottom',
                        message: 'User registered!'
                    })).present();
                    this.saved = true;
                    this.nav.navigateRoot(['/auth/login']);
                },
                error: (error) => {
                    this.registerErrorCode.set(error.status);
                    this.registerForm.get('email')?.setValue('');
                    this.registerForm.get('repeatEmail')?.setValue('');
                },
            });
    }

    /**
     * Captures a photo using the device camera.
     * 
     * @returns {Promise<void>} A promise that resolves when the photo has been taken and processed.
     */
    async takePhoto() {
        const photo = await Camera.getPhoto({
            source: CameraSource.Camera,
            quality: 90,
            height: 200,
            width: 200,
            allowEditing: true,
            resultType: CameraResultType.DataUrl // Base64 (url encoded)
        });

        this.base64image = photo.dataUrl as string;
        this.changeDetector.markForCheck();
    }

    /**
     * Picks an image from the device.
     * 
     * @returns {Promise<void>} A promise that resolves when the photo is picked and processed.
     */
    async pickFromGallery() {
        const photo = await Camera.getPhoto({
            source: CameraSource.Photos,
            height: 200,
            width: 200,
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
        if (this.saved || (this.registerForm.pristine && this.base64image === "")) return true;

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
