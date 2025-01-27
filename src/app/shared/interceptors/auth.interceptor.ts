import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SsrCookieService } from '../../auth/services/ssr-cookie.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = inject(SsrCookieService).getCookie('token');

    if (token) { // Estamos autenticados
        const authReq = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + token),
        });
        return next(authReq); // Petición con credenciales
    }
    return next(req); // Petición sin credenciales
};