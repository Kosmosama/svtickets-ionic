import { Component, effect, inject, input, signal } from '@angular/core';
import { EventCardComponent } from "../event-card/event-card.component";
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { Comment, MyEvent } from '../../shared/interfaces/my-event';
import { OlMapDirective } from '../../ol-maps/ol-map.directive';
import { OlMarkerDirective } from '../../ol-maps/ol-marker.directive';
import { ValidationClassesDirective } from '../../shared/directives/valdation-classes.directive';
import { User } from '../../shared/interfaces/user';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { EventsService } from '../services/events.service';

@Component({
    selector: 'event-detail',
    standalone: true,
    imports: [EventCardComponent, OlMapDirective, OlMarkerDirective, ValidationClassesDirective, RouterLink, ReactiveFormsModule, DatePipe],
    templateUrl: './event-detail.component.html',
    styleUrl: './event-detail.component.css'
})
export class EventDetailComponent {
    private eventService = inject(EventsService);
    private titleService = inject(Title);
    private router = inject(Router);
    private fb = inject(NonNullableFormBuilder);

    event = input.required<MyEvent>();

    attendees = signal<User[]>([]);
    comments = signal<Comment[]>([]);
    commentErrorCode = signal<number | null>(null);

    commentForm = this.fb.group({
        comment: ["", Validators.required]
    });

    constructor() {
        effect(() => {
            if (this.event()) {
                this.titleService.setTitle(this.event()!.title + ' | SVtickets');
                this.showAttendees(this.event().id);
            }
        });
    }

    /**
     * Fetches and sets the comments for the given event ID.
     * @param id - The ID of the event.
     */
    showComments(id: number) {
        this.eventService.getComments(id).subscribe((comments) => {
            this.comments.set(comments);
        });
    }

    /**
     * Fetches and sets the attendees for the given event ID.
     * @param id - The ID of the event.
     */
    showAttendees(id: number) {
        this.commentErrorCode.set(null);
        
        this.eventService.getAttendees(id).subscribe((attendees) => {
            this.attendees.set(attendees);
            this.showComments(id);
        });
    }

    /**
     * Adds a new comment to the event.
     * Validates the comment form and posts the comment if valid.
     * Resets the comment form after posting.
     */
    addComment() {
        this.commentErrorCode.set(null);

        if (this.commentForm.invalid) {
            this.commentForm.markAllAsTouched();
            return;
        }

        this.eventService.postComment(this.event().id, this.commentForm.get('comment')!.value).subscribe({
            next: (comment) => {
                this.comments.update((comments) => [comment, ...comments]);
            },
            error: (error) => {
                this.commentErrorCode.set(error.status);
            }
        });

        this.commentForm.reset();
    }

    /**
     * Redirects user to initial page.
     */
    goBack() {
        this.router.navigate(['/events']);
    }
}
