import { DatePipe } from "@angular/common";
import { Component, DestroyRef, effect, inject, input, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NonNullableFormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from "@angular/forms";
import { Router } from "@angular/router";
// import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
// import { GaAutocompleteDirective } from "../../ol-maps/ga-autocomplete.directive";
// import { OlMapDirective } from "../../ol-maps/ol-map.directive";
// import { OlMarkerDirective } from "../../ol-maps/ol-marker.directive";
// import { SearchResult } from "../../ol-maps/search-result";
import { EncodeBase64Directive } from "../../shared/directives/encode-base64.directive";
import { minDateValidator } from "../../shared/directives/min-date.directive";
import { ValidationClassesDirective } from "../../shared/directives/valdation-classes.directive";
import { CanComponentDeactivate } from "../../shared/interfaces/can-component-deactivate";
import { MyEvent, MyEventInsert } from "../../shared/interfaces/my-event";
// import { ConfirmModalComponent } from "../../shared/modals/confirm-modal/confirm-modal.component";
import { EventsService } from "../services/events.service";

@Component({
    selector: "event-form",
    standalone: true,
    imports: [ReactiveFormsModule, EncodeBase64Directive, ValidationClassesDirective, DatePipe], //, OlMapDirective, OlMarkerDirective, GaAutocompleteDirective
    templateUrl: "./event-form.component.html",
    styleUrl: "./event-form.component.css"
})
export class EventFormComponent implements CanComponentDeactivate {
    private eventsService = inject(EventsService);
    private destroyRef = inject(DestroyRef);
    private router = inject(Router);
    // private modalService = inject(NgbModal);

    event = input<MyEvent>();

    saved = false;
    today: string = new Date().toISOString().split('T')[0];
    base64image = "";
    address = "";
    coordinates = signal<[number, number]>([-0.5, 38.5]);
    error = signal<number | null>(null);

    // changePlace(result: SearchResult) {
    //     this.coordinates.set(result.coordinates);
    //     this.address = result.address;
    // }

    private fb = inject(NonNullableFormBuilder);
    eventForm = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(5), Validators.pattern('^[a-zA-Z][a-zA-Z ]*$')]],
        date: ['', [Validators.required, minDateValidator(this.today)]],
        description: ['', [Validators.required]],
        price: [0, [Validators.required, Validators.min(0.1)]],
        image: ['', [this.imageRequiredValidatior()]],
    });

    constructor() {
        effect(() => {
            if (this.event()) {
                this.eventForm.get('title')?.setValue(this.event()!.title);
                this.eventForm.get('date')?.setValue(this.event()!.date.split(' ')[0]);
                this.eventForm.get('description')?.setValue(this.event()!.description);
                this.eventForm.get('price')?.setValue(this.event()!.price);
                this.coordinates.set([this.event()!.lng, this.event()!.lat]);
                this.address = this.event()!.address;
                this.base64image = this.event()!.image;
                this.eventForm.markAllAsTouched();
            }
        });
    }

    /**
     * Validator function to check if the base64 image string is empty.
     * 
     * @returns A validation error object with `imageRequiredError` set to true if the base64 image string is not empty, otherwise null.
     */
    imageRequiredValidatior(): ValidatorFn {
        return () => this.base64image ? null : { imageRequiredError: true };
    }

    /**
     * Handles adding a new event by interacting with the EventsService.
     * Navigates user back to "/events" upon creation.
     */
    submitNewEvent(): void {
        const [lng, lat] = this.coordinates();
        const event: MyEventInsert = {
            ...this.eventForm.getRawValue(),
            image: this.base64image,
            address: this.address,
            lat: lat,
            lng: lng
        };

        this.eventsService.saveEvent(event, this.event()?.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.saved = true;
                    this.router.navigate(['/events']);
                },
                error: (error) => {
                    this.error.set(error.status);
                }
            });
    }

    /**
     * Determines whether the user can navigate away from the current page.
     * If there are unsaved changes, the user is prompted with a confirmation dialog.
     * 
     * @returns "True" if the changes were saved, form values were not changed or the user confirms the dialog, otherwise "False".
     */
    canDeactivate() {
        if (this.saved || this.eventForm.pristine) return true;
        return confirm();

        // const modalRef = this.modalService.open(ConfirmModalComponent);
        // modalRef.componentInstance.title = 'Changes will not be saved';
        // modalRef.componentInstance.body = 'Do you want to leave the page?. Changes will be lost...';
        // return modalRef.result.catch(() => false);
    }

    /**
     * Checks whether the image input change actually placed a valid image, if the image was invalid,
     * sets image preview to hidden once again.
     * 
     * @param fileInputElement Input element that contains the files.
     */
    checkImage(fileInputElement: HTMLInputElement) {
        if (!fileInputElement.files || fileInputElement.files.length === 0) this.base64image = '';
        this.eventForm.get('image')?.updateValueAndValidity();
    }

    /**
     * Handles the encoded image by setting the base64 string to the `base64image` property
     * and updating the validity of the 'image' form control in the event form.
     *
     * @param base64 - The base64 encoded string of the image.
     */
    handleEncodedImage(base64: string) {
        this.base64image = base64;
        this.eventForm.get('image')?.updateValueAndValidity();
    }
}