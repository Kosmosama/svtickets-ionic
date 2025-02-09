import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: "info",
        loadComponent: () =>
            import('./event-info/event-info.page').then(
                (m) => m.EventInfoPage
            ),
    },
    {
        path: "comments",
        loadComponent: () =>
            import('./event-comments/event-comments.page').then(
                (m) => m.EventCommentsPage
            ),
    },
    {
        path: "attend",
        loadComponent: () =>
            import('./event-attend/event-attend.page').then(
                (m) => m.EventAttendPage
            ),
    },
    {
        path: "location",
        loadComponent: () =>
            import('./event-location/event-location.page').then(
                (m) => m.EventLocationPage
            ),
    },
    {
        path: "",
        pathMatch: "full",
        redirectTo: "info"
    }
];
