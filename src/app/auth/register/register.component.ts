import { afterNextRender, Component, DestroyRef, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { EncodeBase64Directive } from '../../shared/directives/encode-base64.directive';
import { User } from '../../shared/interfaces/user';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ValidationClassesDirective } from '../../shared/directives/valdation-classes.directive';
import { Router, RouterLink } from '@angular/router';
import { GeolocationService } from '../services/geolocation.service';
// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { ConfirmModalComponent } from '../../shared/modals/confirm-modal/confirm-modal.component';

@Component({
    selector: 'register',
    standalone: true,
    imports: [EncodeBase64Directive, ReactiveFormsModule, ValidationClassesDirective, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    private authService = inject(AuthService);
    private fb = inject(NonNullableFormBuilder);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);
    // private modalService = inject(NgbModal);

    registerErrorCode = signal<number | null>(null);

    saved = false;
    base64image = "";

    constructor() {
        afterNextRender(() => {
            GeolocationService.getLocation()
                .then((coords) => {
                    this.registerForm.get('lat')?.setValue(coords.latitude);
                    this.registerForm.get('lng')?.setValue(coords.longitude);
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
        avatar: ['', Validators.required],
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
     * Checks whether the image input change actually placed a valid image, if the image was invalid,
     * sets image preview to hidden once again.
     * 
     * @param fileInputElement Input element that contains the files.
     */
    checkImage(fileInputElement: HTMLInputElement) {
        if (!fileInputElement.files || fileInputElement.files.length === 0) this.base64image = '';
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
                next: () => {
                    this.saved = true;
                    this.router.navigate(['/auth/login']);
                },
                error: (error) => {
                    // this.registerForm.get('email')?.setErrors({ serverError: true});
                    this.registerErrorCode.set(error.status);
                    this.registerForm.get('email')?.setValue('');
                    this.registerForm.get('repeatEmail')?.setValue('');
                    window.scrollTo(0, 0);
                },
            });
    }

    /**
     * Determines whether the user can navigate away from the current page.
     * If there are unsaved changes, the user is prompted with a confirmation dialog.
     * 
     * @returns "True" if the changes were saved, form values were not changed or the user confirms the dialog, otherwise "False".
     */
    canDeactivate() {
        if (this.saved || this.registerForm.pristine) return true;
        return confirm();
            
        // const modalRef = this.modalService.open(ConfirmModalComponent);
        // modalRef.componentInstance.title = 'Changes will not be saved';
        // modalRef.componentInstance.body = 'Do you want to leave the page?. Changes will be lost...';
        // return modalRef.result.catch(() => false);
    }
}
