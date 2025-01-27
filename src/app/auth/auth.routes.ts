import { Routes } from "@angular/router";
import { leavePageGuard } from "../shared/guards/leave-page.guard";

export const routes: Routes = [
    { path: "login", data: { animation: 'login' }, loadComponent: () => import("./login/login.component").then((c) => c.LoginComponent), title: "Login | SVtickets"},
    { path: "register", data: { animation: 'register' }, canDeactivate: [leavePageGuard], loadComponent: () => import("./register/register.component").then((c) => c.RegisterComponent), title: "Register | SVtickets"},
];