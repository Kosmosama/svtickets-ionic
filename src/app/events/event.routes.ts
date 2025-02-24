import { Routes } from '@angular/router';
import { leavePageGuard } from '../shared/guards/leave-page.guard';
import { numericIdGuard } from '../shared/guards/numeric-id.guard';
import { eventResolver } from './resolvers/event.resolver';

export const routes: Routes = [
    {
        path: '',
        data: { animation: 'events' },
        loadComponent: () =>
            import('./events-page/events-page.page').then(
                (c) => c.EventsPagePage
            ),
        title: 'Events | SVtickets',
    },
    {
        path: 'add',
        data: { animation: 'eventAdd' },
        canDeactivate: [leavePageGuard],
        loadComponent: () =>
            import('./event-form/event-form.page').then((c) => c.EventFormPage),
        title: 'New Event | SVtickets',
    },
    {
        path: 'edit/:id',
        data: { animation: 'eventEdit' },
        canActivate: [numericIdGuard],
        canDeactivate: [leavePageGuard],
        loadComponent: () =>
            import('./event-form/event-form.page').then((c) => c.EventFormPage),
        resolve: { event: eventResolver },
        title: 'Edit event | SVtickets',
    },
    {
        path: ':id',
        data: { animation: 'eventDetail' },
        canActivate: [numericIdGuard],
        loadComponent: () =>
            import('./event-detail/event-detail.page').then(
                (c) => c.EventDetailPage
            ),
        loadChildren: () =>
            import('./event-detail/event-detail.routes').then(
                (m) => m.routes
            ),
        resolve: { event: eventResolver },
        title: 'Event | SVtickets',
    },
];
