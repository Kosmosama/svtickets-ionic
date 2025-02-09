import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonAlert, IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonLabel, IonList, IonRow, IonText, IonTitle, IonToolbar, NavController } from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { ThirdPartyLogin, UserLogin } from 'src/app/shared/interfaces/user';
import { AuthService } from '../services/auth.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
    standalone: true,
    imports: [IonIcon, IonCol, IonRow, IonGrid, IonList, IonInput, IonButton, IonAlert, IonLabel, IonText, IonContent, IonLabel, IonHeader, IonTitle, IonToolbar, CommonModule, ReactiveFormsModule, RouterLink]
})
export class LoginPage {
    private authService = inject(AuthService);
    private fb = inject(NonNullableFormBuilder);
    private nav = inject(NavController);
    private destroyRef = inject(DestroyRef);

    loginErrorCode = signal<number | null>(null);

    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
    });

    /**
     * Logs in a user with geolocation data appended.
     * [Was separated into being a function so that it could be used with google login]
     * 
     * @param {UserLogin | ThirdPartyLogin} user - The user details for login, either form-based or third-party.
     * 
     * @returns {Observable<void>} An Observable that completes upon successful login or emits an error.
     */
    private login(user: UserLogin | ThirdPartyLogin): Observable<void> {
        return new Observable<void>((observer) => {
            Geolocation.getCurrentPosition({ enableHighAccuracy: true })
                .then((coordinates) => {
                    user.lat = coordinates.coords.latitude;
                    user.lng = coordinates.coords.longitude;
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
                next: () => this.nav.navigateRoot(['/events']),
                error: (error) => {
                    this.loginErrorCode.set(error.status);
                }
            });
    }
}
