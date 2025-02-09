
import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SplashScreen } from '@capacitor/splash-screen';
import { IonApp, IonAvatar, IonContent, IonIcon, IonImg, IonItem, IonLabel, IonList, IonMenu, IonMenuToggle, IonRouterLink, IonRouterOutlet, IonSplitPane, NavController, Platform } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeSharp, addSharp, archiveOutline, archiveSharp, arrowUndoCircleSharp, bookmarkOutline, bookmarkSharp, camera, createSharp, eyeSharp, heartOutline, heartSharp, homeSharp, images, logIn, logOutSharp, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, peopleSharp, personAddOutline, thumbsDownSharp, thumbsUpSharp, trashBinSharp, trashOutline, trashSharp, warningOutline, warningSharp, informationSharp, chatbubblesSharp, locationSharp, navigateSharp, personAddSharp, personRemoveSharp, shieldHalfSharp } from 'ionicons/icons';
import { AuthService } from './auth/services/auth.service';
import { ProfileService } from './profile/services/profile.service';
import { User } from './shared/interfaces/user';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    imports: [RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet, IonAvatar, IonImg],
})
export class AppComponent {
    private authService = inject(AuthService);
    private profileService = inject(ProfileService);
    private platform = inject(Platform);
    private nav = inject(NavController);
    
    user = signal<User | null>(null);

    public appPages = [
        { title: 'Home', url: '/events', icon: 'home-sharp' },
    ];
    public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
    constructor() {
        addIcons({ shieldHalfSharp, personAddSharp, personRemoveSharp, navigateSharp, locationSharp, peopleSharp, chatbubblesSharp, informationSharp, closeSharp, createSharp, eyeSharp, arrowUndoCircleSharp ,logOutSharp, addSharp, homeSharp, trashBinSharp, thumbsUpSharp, thumbsDownSharp, images, camera, logIn, personAddOutline, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp });

        effect(() => {
            if (this.authService.logged()) {
                this.profileService.getUser().subscribe((user) => (this.user.set(user)));
            } else {
                this.user.set(null);
            }
        });

        this.initializeApp();
    }

    async initializeApp() {
        if (this.platform.is('capacitor')) {
            await this.platform.ready();
            SplashScreen.hide();
        }
    }

    async logout() {
        await this.authService.logout();
        this.nav.navigateRoot(['/auth/login']);
    }
}