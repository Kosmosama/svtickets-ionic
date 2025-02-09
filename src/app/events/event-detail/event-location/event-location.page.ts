import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LaunchNavigator } from '@awesome-cordova-plugins/launch-navigator';
import { IonContent, IonFab, IonFabButton, IonHeader, IonLabel, IonToolbar, IonIcon, Platform } from '@ionic/angular/standalone';
import { OlMapDirective } from 'src/app/ol-maps/ol-map.directive';
import { OlMarkerDirective } from 'src/app/ol-maps/ol-marker.directive';
import { EventDetailPage } from '../event-detail.page';

@Component({
    selector: 'app-event-location',
    templateUrl: './event-location.page.html',
    styleUrls: ['./event-location.page.scss'],
    standalone: true,
    imports: [IonIcon, IonFabButton, IonFab, IonLabel, IonContent, IonHeader, IonToolbar, CommonModule, FormsModule, OlMapDirective, OlMarkerDirective]
})
export class EventLocationPage {
    private platform = inject(Platform);

    event = inject(EventDetailPage).event;
    coordinates = signal<[number, number]>([-0.5, 38.5]);
    isPlatformCapacitor = signal<boolean>(false);

    constructor() {
        this.coordinates.set([this.event()!.lng, this.event()!.lat]);
        this.isPlatformCapacitor.set(this.platform.is('capacitor'));
    }

    /**
     * Navigates to the specified coordinates using the LaunchNavigator.
     * 
     * @returns {Promise<void>} A promise that resolves when the navigation is initiated.
     */
    async navigate() {
        LaunchNavigator.navigate(this.coordinates().reverse());
    }
}