import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, REQUEST } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root',
})
export class SsrCookieService {
    #cookieService = inject(CookieService);
    private platformId = inject(PLATFORM_ID);
    private request = inject(REQUEST);

    getCookie(name: string) {
        if (isPlatformBrowser(this.platformId)) { // Cliente
            return this.#cookieService.get(name);
        } else { // Servidor
            return this.request!.headers.get('cookie')
                ?.split('; ')
                .find((cookie) => cookie.startsWith(name + '='))
                ?.split('=')[1] ?? '';
        }
    }
}