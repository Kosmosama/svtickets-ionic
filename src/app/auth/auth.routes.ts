import { Routes } from '@angular/router';
import { leavePageGuard } from '../shared/guards/leave-page.guard';

export const routes: Routes = [
    {
        path: 'login',
        data: { animation: 'login' },
        loadComponent: () =>
            import('./login/login.page').then((c) => c.LoginPage),
        title: 'Login | SVtickets',
    },
    {
        path: 'register',
        data: { animation: 'register' },
        canDeactivate: [leavePageGuard],
        loadComponent: () =>
            import('./register/register.page').then((c) => c.RegisterPage),
        title: 'Register | SVtickets',
    },
];
