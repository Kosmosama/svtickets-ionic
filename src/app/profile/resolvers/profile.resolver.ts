import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { ProfileService } from '../services/profile.service';
import { catchError, EMPTY } from 'rxjs';
import { User } from '../../shared/interfaces/user';

export const profileResolver: ResolveFn<User> = (route, state) => {
    const profileService = inject(ProfileService);
    const router = inject(Router);

    return profileService.getUser(route.params["id"] ? +route.params["id"] : undefined).pipe(
        catchError(() => {
            router.navigate(["/error"]);
            return EMPTY;
        })
    );
};
