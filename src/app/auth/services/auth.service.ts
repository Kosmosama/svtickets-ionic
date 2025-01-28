import { HttpClient } from "@angular/common/http";
import { inject, Injectable, Signal, signal, WritableSignal } from "@angular/core";
// import { CookieService } from "ngx-cookie-service";
import { catchError, map, Observable, of } from "rxjs";
import { TokenResponse } from "../../shared/interfaces/responses";
import { ThirdPartyLogin, User, UserLogin } from "../../shared/interfaces/user";
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
                map(({ accessToken }: TokenResponse) => {
                    // this.cookieService.set("token", accessToken, 365, "/");
                    this.#logged.set(true);
                })
            );
    }

    /**
     * Logs out the user by clearing the authentication token and updating the logged-in state.
     */
    logout(): void {
        // this.cookieService.delete("token", "/");
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
    private validateToken(): Observable<boolean> {
        return this.http
            .get("auth/validate")
            .pipe(
                map(() => {
                    this.#logged.set(true);
                    return true;
                }),
                catchError(() => {
                    // this.cookieService.delete("token", "/");
                    this.#logged.set(false);
                    return of(false);
                })
            );
    }

    /**
     * Checks if the user is currently logged in.
     * @returns {Observable<boolean>} An observable emitting true if the user is logged in, or false otherwise.
     */
    isLogged(): Observable<boolean> {
        // const token = this.ssrCookieService.getCookie('token');

        // User is logged if signal is true
        if (this.#logged()) return of(true);

        // User is not logged and token is missing
        // if (!token) return of(false);

        // Token exists, validate it
        return this.validateToken();
    }
}
