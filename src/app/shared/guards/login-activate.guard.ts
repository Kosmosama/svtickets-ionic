import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const loginActivateGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService
        .isLogged()
        .pipe(
            map(isLogged => {
                if (!isLogged) return router.createUrlTree(["auth/login"]);
                return true;
            })
        );
};
