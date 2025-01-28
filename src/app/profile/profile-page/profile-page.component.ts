import { Component, DestroyRef, inject, input, model, signal } from '@angular/core';
import { User, UserPasswordEdit, UserPhotoEdit, UserProfileEdit } from '../../shared/interfaces/user';
// import { OlMapDirective } from '../../ol-maps/ol-map.directive';
// import { OlMarkerDirective } from '../../ol-maps/ol-marker.directive';
import { RouterLink } from '@angular/router';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ValidationClassesDirective } from '../../shared/directives/valdation-classes.directive';
import { ProfileService } from '../services/profile.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EncodeBase64Directive } from '../../shared/directives/encode-base64.directive';

@Component({
    selector: 'profile-page',
    standalone: true,
    imports: [RouterLink, ReactiveFormsModule, ValidationClassesDirective, EncodeBase64Directive], // OlMapDirective, OlMarkerDirective, 
    templateUrl: './profile-page.component.html',
    styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {
    private fb = inject(NonNullableFormBuilder);
    private profileService = inject(ProfileService);
    private destroyRef = inject(DestroyRef);

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
     * If the form is invalid, it marks all fields as touched.
     * On successful profile update, it merges the updated profile data with the current user data,
     * cancels the edit mode, and resets the profile form.
     */
    changeProfile() {
        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            return;
        }

        this.profileService
            .updateProfile({...this.profileForm.getRawValue()})
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.user.set({...this.user(), ...this.profileForm.getRawValue()});
                this.cancelEdit();
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
                this.cancelEdit();
                this.passwordForm.reset();
            });
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
                this.user.set({...this.user(), avatar});
            });
    }

    // Signals and functions to control the visibility of the profile info, profile form, and password form.

    showProfileInfo = signal(true);
    showProfileForm = signal(false);
    showPasswordForm = signal(false);

    editProfile() {
        this.showProfileInfo.set(false);
        this.showProfileForm.set(true);
        this.showPasswordForm.set(false);
    }

    editPassword() {
        this.showProfileInfo.set(false);
        this.showProfileForm.set(false);
        this.showPasswordForm.set(true);
    }

    cancelEdit() {
        this.showProfileInfo.set(true);
        this.showProfileForm.set(false);
        this.showPasswordForm.set(false);
    }
}
