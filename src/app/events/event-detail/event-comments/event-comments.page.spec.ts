import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventCommentsPage } from './event-comments.page';

describe('EventCommentsPage', () => {
  let component: EventCommentsPage;
  let fixture: ComponentFixture<EventCommentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventCommentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
