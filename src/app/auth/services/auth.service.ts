import { HttpClient } from "@angular/common/http";
import { inject, Injectable, Signal, signal, WritableSignal } from "@angular/core";
// import { CookieService } from "ngx-cookie-service";
import { catchError, from, map, Observable, of, switchMap } from "rxjs";
import { TokenResponse } from "../../shared/interfaces/responses";
import { ThirdPartyLogin, User, UserLogin } from "../../shared/interfaces/user";
import { Preferences } from "@capacitor/preferences";
// import { SsrCookieService } from "./ssr-cookie.service";

@Injectable({
    providedIn: "root"
})
export class AuthService {
    private http = inject(HttpClient);
    // private cookieService = inject(CookieService);
    // private ssrCookieService = inject(SsrCookieService);

    #logged: WritableSignal<boolean> = signal(false);

    get logged(): Signal<boolean> {
        return this.#logged.asReadonly();
    }

    /**
     * Determines if the provided payload is a ThirdPartyLogin object.
     * @param {UserLogin | ThirdPartyLogin} payload - The login payload to check.
     * @returns {boolean} True if the payload is a ThirdPartyLogin, false otherwise.
     */
    private isThirdPartyLogin(payload: UserLogin | ThirdPartyLogin): payload is ThirdPartyLogin {
        return (payload as ThirdPartyLogin).token !== undefined;
    }

    /**
     * Logs in the user using either a standard login payload or a third-party login payload.
     * @param {UserLogin | ThirdPartyLogin} payload - The login payload containing user credentials or a third-party token.
     * @returns {Observable<void>} An observable that completes when the login process is done.
     */
    login(payload: UserLogin | ThirdPartyLogin): Observable<void> {
        const endpoint = this.isThirdPartyLogin(payload) ? "auth/google" : "auth/login";
        return this.http
            .post<TokenResponse>(endpoint, payload)
            .pipe(
                switchMap(async ({ accessToken }: TokenResponse) => {
                    try {
                        await Preferences.set({ key: 'fs-token', value: accessToken });
                        this.#logged.set(true);
                    } catch (e) {
                        throw new Error('Can\'t save authentication token in storage!');
                    }
                })
            );
    }

    /**
     * Logs out the user by clearing the authentication token and updating the logged-in state.
     */
    async logout(): Promise<void> {
        await Preferences.remove({ key: 'fs-token' });
        this.#logged.set(false);
    }

    /**
     * Registers a new user with the provided user details.
     * @param {User} user - The user object containing registration details.
     * @returns {Observable<void>} An observable that completes when the registration process is done.
     */
    register(user: User): Observable<void> {
        return this.http.post<void>("auth/register", user);
    }

    /**
     * Validates the provided authentication token.
     * @returns {Observable<boolean>} An observable emitting true if the token is valid, or false otherwise.
     */
    private validateToken(token: string | null): Observable<boolean> {
        return this.http.get('auth/validate').pipe(
            map(() => {
                this.#logged.set(true);
                return true;
            }),
            catchError(() => of(false))
        );
    }

    /**
     * Checks if the user is currently logged in.
     * @returns {Observable<boolean>} An observable emitting true if the user is logged in, or false otherwise.
     */
    isLogged(): Observable<boolean> {
        if (this.#logged()) return of(true);
        
        return from(Preferences.get({ key: 'fs-token' })).pipe(
            switchMap((token) => {
                if (!token) return of(false);

                return this.validateToken(token.value)
            })
        );
    }
}
