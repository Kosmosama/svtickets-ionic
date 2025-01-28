import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationClassesDirective } from '../../shared/directives/valdation-classes.directive';
import { ThirdPartyLogin, UserLogin } from '../../shared/interfaces/user';
import { GeolocationService } from '../services/geolocation.service';
import { AuthService } from '../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'login',
    standalone: true,
    imports: [ReactiveFormsModule, ValidationClassesDirective, RouterLink, ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    private authService = inject(AuthService);
    private fb = inject(NonNullableFormBuilder);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);

    loginErrorCode = signal<number | null>(null);

    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
    });

    /**
     * Logs in a user with geolocation data appended.
     * @param {UserLogin | ThirdPartyLogin} user - The user details for login, either form-based or third-party.
     * @returns {Observable<void>} An Observable that completes upon successful login or emits an error.
     */
    private login(user: UserLogin | ThirdPartyLogin): Observable<void> {
        return new Observable<void>((observer) => {
            GeolocationService.getLocation()
                .then((coords) => {
                    user.lat = coords.latitude;
                    user.lng = coords.longitude;
                })
                .catch((error) => {
                    console.warn('Could not retrieve location, using default coordinates:', error);
                })
                .finally(() => {
                    this.authService
                        .login(user)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe({
                            next: () => {
                                observer.next();
                                observer.complete();
                            },
                            error: (error) => {
                                observer.error(error);
                            }
                        });
                });
        });
    }

    /**
     * Handles Google login, including geolocation and navigation.
     * @param {google.accounts.id.CredentialResponse} resp - The credential response from Google login.
     */
    // loginWithGoogle(resp: google.accounts.id.CredentialResponse) {
    //     const thirdPartyUser: ThirdPartyLogin = {
    //         token: resp.credential,
    //         lat: 0,
    //         lng: 0,
    //     };

    //     this.login(thirdPartyUser)
    //         .pipe(takeUntilDestroyed(this.destroyRef))
    //         .subscribe(() => {
    //             this.router.navigate(['/events']);
    //         });
    // }

    /**
     * Handles form-based login, including geolocation and navigation.
     */
    loginWithForm(): void {
        this.loginErrorCode.set(null);

        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const user: UserLogin = {
            ...this.loginForm.getRawValue(),
            lat: 0,
            lng: 0,
        };

        this.login(user)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => { this.router.navigate(['/events']); },
                error: (error) => { 
                    this.loginErrorCode.set(error.status);
                }
            });
    }
}
