import { ChangeDetectorRef, Component, DestroyRef, inject, model, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { IonInput, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonImg, IonLabel, IonList, IonModal, IonRow, IonText, IonTitle, IonToolbar } from "@ionic/angular/standalone";
import { OlMapDirective } from 'src/app/ol-maps/ol-map.directive';
import { OlMarkerDirective } from 'src/app/ol-maps/ol-marker.directive';
import { User, UserPasswordEdit, UserPhotoEdit } from '../../shared/interfaces/user';
import { ProfileService } from '../services/profile.service';

@Component({
    selector: 'profile-page',
    standalone: true,
    imports: [IonInput, IonText, IonList, IonLabel, IonButtons, IonModal, IonIcon, IonButton, IonCol, IonRow, IonGrid, IonToolbar, IonTitle, IonHeader, IonContent, IonImg, RouterLink, ReactiveFormsModule, OlMapDirective, OlMarkerDirective],
    templateUrl: './profile.page.html',
    styleUrl: './profile.page.scss'
})
export class ProfilePage {
    private fb = inject(NonNullableFormBuilder);
    private profileService = inject(ProfileService);
    private destroyRef = inject(DestroyRef);
    private changeDetector = inject(ChangeDetectorRef);

    user = model.required<User>();

    profileForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        name: ['', [Validators.required]]
    });

    passwordForm = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(4)]],
        password2: ['', [Validators.required, Validators.minLength(4), this.repeatPasswordValidator()]]
    });

    /**
     * Validator function to check if the repeated password matches the original password.
     * 
     * @returns A ValidatorFn that returns null if the passwords match, or an object with the key `passwordMismatch` set to true if they do not.
     */
    repeatPasswordValidator(): ValidatorFn {
        return ({ parent, value }: AbstractControl) => parent?.get('password')?.value === value ? null : { passwordMismatch: true };
    }

    /**
     * Updates the user's profile (email and name) if the form is valid.
     * Marks all form fields as touched if the form is invalid.
     * Calls the profile service to update the profile and resets the form upon success.
     */
    changeProfile() {
        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            return;
        }

        this.profileService
            .updateProfile({ ...this.profileForm.getRawValue() })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.user.set({ ...this.user(), ...this.profileForm.getRawValue() });
                this.closeModal();
                this.profileForm.reset();
            });
    }

    /**
     * Changes the user's password if the form is valid.
     * Marks all form fields as touched if the form is invalid.
     * Calls the profile service to update the password and resets the form upon success.
     */
    changePassword() {
        if (this.passwordForm.invalid) {
            this.passwordForm.markAllAsTouched();
            return;
        }

        this.profileService
            .updatePassword({ password: this.passwordForm.get('password')?.value } as UserPasswordEdit)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.closeModal();
                this.passwordForm.reset();
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

        this.changeAvatar(photo.dataUrl as string);
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

        this.changeAvatar(photo.dataUrl as string);
        this.changeDetector.markForCheck();
    }

    /**
     * Updates the user's avatar by sending a base64 encoded image to the profile service.
     *
     * @param base64Image - The base64 encoded image string to be set as the new avatar.
     */
    changeAvatar(base64Image: string) {
        this.profileService
            .updateAvatar({ avatar: base64Image } as UserPhotoEdit)
            .subscribe((avatar) => {
                this.user.set({ ...this.user(), avatar });
            });
    }

    // Basic modal handling functions

    isProfileModalOpen = signal<boolean>(false);
    isPasswordModalOpen = signal<boolean>(false);

    editProfile() {
        this.profileForm.patchValue({
            email: this.user().email,
            name: this.user().name
        });
        this.isProfileModalOpen.set(true);
    }

    editPassword() {
        this.passwordForm.reset();
        this.isPasswordModalOpen.set(true);
    }

    closeModal() {
        this.isProfileModalOpen.set(false);
        this.isPasswordModalOpen.set(false);
    }
}
