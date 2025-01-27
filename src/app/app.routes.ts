import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: "", redirectTo: "/auth/login", pathMatch: "full"},
    
    { path: "auth", loadChildren: () => import("./auth/auth.routes").then(r => r.routes) }, // 
    { path: "events", loadChildren: () => import("./events/event.routes").then(r => r.routes) },
    { path: "profile", loadChildren: () => import("./profile/profile.routes").then(r => r.routes) },
    
    { path: "error", loadComponent: () => import("./shared/error/error.component").then((c) => c.ErrorComponent), title: "Error | SVtickets" },
    
    { path: "**", redirectTo: "error" }
];